export function LineChart() {
  return (
    <div className="w-full h-full p-4 md:p-6 rounded-2xl bg-card border border-border flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-4 flex-wrap">
        <h2 className="text-sm md:text-base font-semibold text-foreground">
          Evolution de la reputation
        </h2>
        <span className="text-sm text-muted-foreground">|</span>
        <div className="flex items-center gap-2 px-2 py-0.5 rounded-lg">
          <div className="w-3 h-3 rounded-full bg-foreground" />
          <span className="text-xs text-muted-foreground">This year</span>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-[250px] flex gap-4">
        {/* Y-axis labels */}
        <div className="flex flex-col justify-between text-xs text-muted-foreground text-right w-10">
          <div>30K</div>
          <div>20K</div>
          <div>10K</div>
          <div>0</div>
        </div>

        {/* Chart area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 relative">
            <svg className="w-full h-full" viewBox="0 0 575 246" preserveAspectRatio="none">
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                </linearGradient>
              </defs>
              
              {/* Grid lines */}
              <line x1="0" y1="0" x2="575" y2="0" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />
              <line x1="0" y1="82" x2="575" y2="82" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />
              <line x1="0" y1="164" x2="575" y2="164" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />
              <line x1="0" y1="246" x2="575" y2="246" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />

              {/* Main line */}
              <path
                d="M0 104L14 98C24 94 29 92 34 92C38 92 42 94 45 96C49 99 51 104 56 114L60 125C61 126 61 127 62 127C67 137 78 141 88 136C89 136 89 135 91 134C91 134 92 134 92 134C96 132 100 130 104 129L115 128C117 128 118 127 120 127C136 124 150 117 162 105C163 104 164 103 165 102C166 100 167 100 168 99C176 91 187 87 198 88L226 91C234 92 238 92 241 91C244 91 247 89 249 87C252 85 254 81 258 75L278 39C280 34 281 31 283 30C286 26 291 24 296 23C298 23 301 23 306 24L315 25C316 26 317 26 317 26C331 27 346 21 354 9L355 8C356 7 356 7 356 7C363 -2 377 -1 382 9L393 34C395 38 396 40 397 42C401 46 407 48 412 47C414 46 416 45 420 43C426 40 429 38 432 37C441 35 450 36 457 41C460 42 462 45 467 49L470 53C477 59 481 63 484 64C489 66 494 66 498 64C502 63 505 60 512 53L525 42C528 39 530 38 531 37C532 36 534 36 535 35C537 34 539 34 543 34L575 29"
                stroke="currentColor"
                strokeOpacity="0.8"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-foreground"
              />
              
              {/* Dotted line */}
              <path
                d="M0 161L36 117C40 112 46 109 53 109L91 111L135 115C140 115 145 114 149 110L204 67C209 63 217 65 220 70L253 138C256 144 262 148 269 149L314 153C321 154 328 150 332 144L356 110C361 102 371 99 380 103L405 112C416 117 428 110 431 98L442 53C444 44 451 38 460 38L507 33C509 33 512 33 514 31L575 1"
                stroke="currentColor"
                strokeOpacity="0.5"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="4 4"
                className="text-muted-foreground"
              />
            </svg>
          </div>

          {/* X-axis labels */}
          <div className="flex justify-between text-xs text-muted-foreground pt-3 border-t border-border">
            <div>Jan</div>
            <div>Feb</div>
            <div>Mar</div>
            <div>Apr</div>
            <div>May</div>
            <div>Jun</div>
            <div>Jul</div>
          </div>
        </div>
      </div>
    </div>
  );
}