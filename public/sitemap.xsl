<?xml version="1.0" encoding="UTF-8"?>
<!--
  Browser-facing stylesheet for the XML sitemaps.

  Crawlers ignore this entirely — they read the raw XML. It exists so that a
  human opening /sitemap.xml sees a readable table instead of a wall of markup,
  which is how the Yoast sitemaps everyone is used to behave.

  One stylesheet covers both document shapes: <sitemapindex> (the index) and
  <urlset> (a child sitemap). The matching template runs, the other doesn't.
-->
<xsl:stylesheet
  version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sm="http://www.sitemaps.org/schemas/sitemap/0.9"
  exclude-result-prefixes="sm">

  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes" />

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex, follow" />
        <title>XML Sitemap · My Home Group</title>
        <style>
          :root {
            color-scheme: light;
            --ink: #1a1a1a;
            --muted: #6b6b6b;
            --line: #e4e4e4;
            --accent: #8a1538;
            --stripe: #fafafa;
          }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 40px 24px 80px;
            font: 14px/1.6 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
                  Helvetica, Arial, sans-serif;
            color: var(--ink);
            background: #fff;
          }
          .wrap { max-width: 1100px; margin: 0 auto; }
          h1 { font-size: 28px; letter-spacing: -0.01em; margin: 0 0 16px; }
          p { margin: 0 0 10px; color: var(--muted); }
          a { color: var(--accent); text-decoration: none; }
          a:hover { text-decoration: underline; }
          .count { margin: 0 0 24px; color: var(--ink); font-weight: 500; }
          .scroll { overflow-x: auto; border: 1px solid var(--line); border-radius: 6px; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th {
            text-align: left;
            padding: 12px 16px;
            border-bottom: 1px solid var(--line);
            font-weight: 600;
            white-space: nowrap;
          }
          td { padding: 10px 16px; border-bottom: 1px solid var(--line); }
          tr:nth-child(even) td { background: var(--stripe); }
          tr:last-child td { border-bottom: 0; }
          td.date { color: var(--muted); white-space: nowrap; }
        </style>
      </head>
      <body>
        <div class="wrap">
          <h1>XML Sitemap</h1>
          <p>
            This is an XML sitemap, meant for consumption by search engines. You can
            find more information about XML sitemaps on
            <a href="https://www.sitemaps.org/">sitemaps.org</a>.
          </p>
          <xsl:apply-templates select="sm:sitemapindex" />
          <xsl:apply-templates select="sm:urlset" />
        </div>
      </body>
    </html>
  </xsl:template>

  <!-- The index: a list of the child sitemaps. -->
  <xsl:template match="sm:sitemapindex">
    <p class="count">
      This XML Sitemap Index file contains
      <xsl:value-of select="count(sm:sitemap)" /> sitemaps.
    </p>
    <div class="scroll">
      <table>
        <tr>
          <th>Sitemap</th>
          <th>Last Modified</th>
        </tr>
        <xsl:for-each select="sm:sitemap">
          <tr>
            <td>
              <a href="{sm:loc}"><xsl:value-of select="sm:loc" /></a>
            </td>
            <td class="date"><xsl:value-of select="sm:lastmod" /></td>
          </tr>
        </xsl:for-each>
      </table>
    </div>
  </xsl:template>

  <!-- A child sitemap: the URLs themselves. -->
  <xsl:template match="sm:urlset">
    <p class="count">
      This XML Sitemap contains <xsl:value-of select="count(sm:url)" /> URLs.
    </p>
    <div class="scroll">
      <table>
        <tr>
          <th>URL</th>
          <th>Last Modified</th>
        </tr>
        <xsl:for-each select="sm:url">
          <tr>
            <td>
              <a href="{sm:loc}"><xsl:value-of select="sm:loc" /></a>
            </td>
            <td class="date"><xsl:value-of select="sm:lastmod" /></td>
          </tr>
        </xsl:for-each>
      </table>
    </div>
  </xsl:template>

</xsl:stylesheet>
