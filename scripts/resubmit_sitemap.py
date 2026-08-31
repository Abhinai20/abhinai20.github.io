"""
Resubmit the DevOps Toolbox sitemap to Google Search Console after every
push to main. This site has no scheduled publishing cadence (it's a static
tool site, updated whenever someone adds/edits a tool), so unlike the two
blogs this runs on push instead of a schedule.

Requires these environment variables (set as GitHub Actions secrets):
    GOOGLE_CLIENT_ID
    GOOGLE_CLIENT_SECRET
    GOOGLE_REFRESH_TOKEN
"""

import json
import os
import sys
import urllib.parse
import urllib.request

SITE_URL = "https://abhinai20.github.io/devops-toolbox/"


def get_access_token():
    data = urllib.parse.urlencode(
        {
            "client_id": os.environ["GOOGLE_CLIENT_ID"],
            "client_secret": os.environ["GOOGLE_CLIENT_SECRET"],
            "refresh_token": os.environ["GOOGLE_REFRESH_TOKEN"],
            "grant_type": "refresh_token",
        }
    ).encode()
    req = urllib.request.Request("https://oauth2.googleapis.com/token", data=data)
    with urllib.request.urlopen(req) as resp:
        return json.load(resp)["access_token"]


def resubmit_sitemap(token):
    site = urllib.parse.quote(SITE_URL, safe="")
    feedpath = urllib.parse.quote(SITE_URL + "sitemap.xml", safe="")
    url = f"https://www.googleapis.com/webmasters/v3/sites/{site}/sitemaps/{feedpath}"
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {token}"}, method="PUT")
    with urllib.request.urlopen(req):
        pass


def main():
    token = get_access_token()
    resubmit_sitemap(token)
    print("Sitemap resubmitted to Search Console for", SITE_URL)


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"Sitemap resubmit failed (non-fatal): {e}", file=sys.stderr)
        # Exit 0 on purpose: a failed resubmit shouldn't fail the whole push/deploy.
