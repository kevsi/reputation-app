import { Job } from 'bull';
import puppeteer from 'puppeteer';
import axios from 'axios';
import { logger } from '../utils/logger';
import { format } from 'date-fns';

interface ReportJobData {
  reportId: string;
  organizationId: string;
  type: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  email?: string;
}

export const reportsProcessor = async (job: Job<ReportJobData>) => {
  const { reportId, organizationId, type, startDate, endDate, email } = job.data;

  let browser;

  try {
    logger.info(`Generating ${type} report ${reportId}`);

    // Récupérer les données depuis l'API
    const [mentions, alerts, stats] = await Promise.all([
      axios.get(`${process.env.API_BASE_URL}/mentions`, {
        params: { organizationId, startDate, endDate },
      }),
      axios.get(`${process.env.API_BASE_URL}/alerts`, {
        params: { organizationId, startDate, endDate },
      }),
      axios.get(`${process.env.API_BASE_URL}/analysis/stats`, {
        params: { organizationId, startDate, endDate },
      }),
    ]);

    // Générer HTML du rapport
    const html = generateReportHTML({
      type,
      startDate,
      endDate,
      mentions: mentions.data,
      alerts: alerts.data,
      stats: stats.data,
    });

    // Générer PDF avec Puppeteer
    browser = await puppeteer.launch({
      headless: true, // ✅ CORRECTION 1
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // ✅ CORRECTION 2 : Conversion explicite en Buffer
    const pdfData = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
    });

    const pdfBuffer = Buffer.from(pdfData);

    await browser.close();
    browser = null;

    // Upload vers S3/MinIO
    const filename = `reports/${organizationId}/${reportId}.pdf`;
    await uploadToS3(filename, pdfBuffer);

    // Mettre à jour le statut du rapport
    await axios.patch(
      `${process.env.API_BASE_URL}/reports/${reportId}`,
      {
        status: 'completed',
        fileUrl: filename,
        generatedAt: new Date().toISOString(),
      }
    );

    // Envoyer par email si demandé
    if (email) {
      await axios.post(`${process.env.API_BASE_URL}/notifications/email`, {
        to: email,
        subject: `Rapport ${type} - ${format(new Date(), 'dd/MM/yyyy')}`,
        template: 'report',
        data: { reportUrl: filename },
        attachments: [
          {
            filename: `report-${type}.pdf`,
            content: pdfBuffer,
          },
        ],
      });
    }

    logger.info(`Report ${reportId} generated successfully`);

    return { reportId, fileUrl: filename };

  } catch (error) {
    logger.error(`Report generation failed for ${reportId}`, error);
    
    // Fermer le navigateur en cas d'erreur
    if (browser) {
      await browser.close().catch(() => {});
    }
    
    throw error;
  }
};

function generateReportHTML(data: any): string {
  // Template HTML simplifié
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Rapport ${data.type}</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          padding: 20px;
          color: #333;
        }
        h1 { 
          color: #2563eb;
          border-bottom: 3px solid #2563eb;
          padding-bottom: 10px;
        }
        .period {
          color: #666;
          font-size: 14px;
          margin-bottom: 30px;
        }
        .stats { 
          display: flex; 
          gap: 20px;
          margin-bottom: 30px;
        }
        .stat-card { 
          padding: 20px; 
          background: #f5f5f5;
          border-radius: 8px;
          flex: 1;
        }
        .stat-card h3 {
          margin: 0 0 10px 0;
          color: #666;
          font-size: 14px;
          text-transform: uppercase;
        }
        .stat-card p {
          margin: 0;
          font-size: 32px;
          font-weight: bold;
          color: #2563eb;
        }
        .section {
          margin-top: 30px;
        }
        .section h2 {
          color: #333;
          border-left: 4px solid #2563eb;
          padding-left: 10px;
        }
      </style>
    </head>
    <body>
      <h1>Rapport ${data.type === 'daily' ? 'Quotidien' : data.type === 'weekly' ? 'Hebdomadaire' : 'Mensuel'}</h1>
      <div class="period">Période: ${format(new Date(data.startDate), 'dd/MM/yyyy')} - ${format(new Date(data.endDate), 'dd/MM/yyyy')}</div>
      
      <div class="stats">
        <div class="stat-card">
          <h3>Mentions</h3>
          <p>${data.mentions.length}</p>
        </div>
        <div class="stat-card">
          <h3>Alertes</h3>
          <p>${data.alerts.length}</p>
        </div>
        <div class="stat-card">
          <h3>Score Moyen</h3>
          <p>${data.stats.averageScore?.toFixed(1) || 'N/A'}</p>
        </div>
      </div>

      <div class="section">
        <h2>Résumé</h2>
        <p>Ce rapport couvre ${data.mentions.length} mentions détectées sur la période.</p>
      </div>
    </body>
    </html>
  `;
}

async function uploadToS3(filename: string, buffer: Buffer): Promise<void> {
  // Implémentation upload S3/MinIO
  // TODO: Utiliser AWS SDK ou MinIO client
  logger.info(`Uploading ${filename} to storage`);
  
  // Exemple avec AWS SDK v3
  /*
  import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
  
  const s3Client = new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: 'us-east-1',
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY!,
      secretAccessKey: process.env.S3_SECRET_KEY!,
    },
    forcePathStyle: true, // Pour MinIO
  });

  await s3Client.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: filename,
    Body: buffer,
    ContentType: 'application/pdf',
  }));
  */
}