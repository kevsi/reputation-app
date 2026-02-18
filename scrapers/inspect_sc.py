import requests
import re

url = "https://www.senscritique.com/serie/heated_rivalry/127695502/critiques"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
}

response = requests.get(url, headers=headers)
html = response.text

# Look for review containers
# Based on common SensCritique patterns or searching for keywords
print("Searching for 'critique' classes/ids...")
potential_containers = re.findall(r'class="([^"]*critique[^"]*)"', html)
print(f"Potential classes containing 'critique': {set(potential_containers[:10])}")

potential_itemprops = re.findall(r'itemprop="([^"]*)"', html)
print(f"Itemprops found: {set(potential_itemprops)}")

# Search for the review titles seen in the markdown
titles = ["Je t'aime, je n'en peux plus", "Quand le Hockey rentre dans les annales"]
for title in titles:
    index = html.find(title)
    if index != -1:
        print(f"\nFound title '{title}' at index {index}")
        print("Context around title:")
        print(html[index-500:index+500])
