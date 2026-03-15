# SEO Quick Reference Guide

## 🚀 Quick Start

### Add SEO to a New Page

```tsx
import SEO from '@/components/SEO/SEO';

function MyPage() {
  return (
    <>
      <SEO 
        title="Your Page Title"
        description="Your page description (150-160 chars)"
        keywords="keyword1, keyword2, keyword3"
        url="https://aiforjob.ai/your-page"
      />
      
      {/* Your page content */}
    </>
  );
}
```

### Add Structured Data

```tsx
import StructuredData from '@/components/SEO/StructuredData';
import { structuredData } from '@/utils/seo';

// For FAQ pages
<StructuredData data={structuredData.faqPage([
  { question: "What is AI for Job?", answer: "..." },
  { question: "How does it work?", answer: "..." }
])} />

// For course pages
<StructuredData data={structuredData.course({
  name: "Interview Preparation Course",
  description: "Master technical interviews",
  provider: "AI for Job"
})} />

// For organization/service pages
<StructuredData data={structuredData.organization} />
<StructuredData data={structuredData.service} />
```

### Optimize Images

```tsx
import OptimizedImage from '@/components/common/OptimizedImage';

// Regular image (lazy loaded)
<OptimizedImage
  src="/path/to/image.jpg"
  alt="Descriptive alt text"
  width={800}
  height={600}
/>

// Above-the-fold image (load immediately)
<OptimizedImage
  src="/hero-image.jpg"
  alt="Hero image"
  width={1200}
  height={600}
  priority={true}
/>
```

## 📝 SEO Best Practices

### Title Tags
- **Length**: 50-60 characters
- **Format**: "Page Title - AI for Job"
- **Include**: Primary keyword
- **Unique**: Every page should have a unique title

### Meta Descriptions
- **Length**: 150-160 characters
- **Include**: Call-to-action
- **Unique**: Every page should have a unique description
- **Compelling**: Entice users to click

### Keywords
- **Count**: 5-10 relevant keywords
- **Format**: Comma-separated
- **Natural**: Use phrases users actually search for
- **Relevant**: Match page content

### Images
- **Alt text**: Always provide descriptive alt text
- **File names**: Use descriptive names (not IMG_1234.jpg)
- **Size**: Optimize file size for web
- **Dimensions**: Specify width and height

### URLs
- **Clean**: Use readable, meaningful URLs
- **Lowercase**: Use lowercase letters
- **Hyphens**: Separate words with hyphens
- **Short**: Keep URLs concise

## 🔧 Common Tasks

### Update Sitemap
When adding a new public page, update `public/sitemap.xml`:

```xml
<url>
  <loc>https://aiforjob.ai/new-page</loc>
  <lastmod>2026-03-15</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>
```

### Block Routes from Crawlers
Update `public/robots.txt`:

```
Disallow: /private-route/
```

### Configure Canonical URL
```tsx
<SEO 
  canonical="https://aiforjob.ai/preferred-url"
/>
```

### Prevent Page Indexing
```tsx
<SEO 
  noindex={true}
/>
```

## 📊 Testing Tools

Before deploying:

1. **Lighthouse**: `npm run build && npm run preview` then run Lighthouse
2. **Facebook Debugger**: https://developers.facebook.com/tools/debug/
3. **Twitter Card Validator**: https://cards-dev.twitter.com/validator
4. **Google Rich Results**: https://search.google.com/test/rich-results
5. **Mobile-Friendly Test**: https://search.google.com/test/mobile-friendly

## 🎯 SEO Checklist

Before launching a new page:

- [ ] Unique page title (50-60 chars)
- [ ] Compelling meta description (150-160 chars)
- [ ] Relevant keywords (5-10)
- [ ] All images have alt text
- [ ] Proper heading hierarchy (H1 → H2 → H3)
- [ ] Internal links to related pages
- [ ] Canonical URL set
- [ ] Added to sitemap.xml
- [ ] Mobile responsive
- [ ] Fast load time (< 3s)
- [ ] No broken links
- [ ] Structured data (if applicable)
- [ ] Social sharing tags tested

## 🔍 Common Issues

### Meta tags not updating
**Problem**: Changes to SEO component not reflected
**Solution**: Clear browser cache and rebuild

### Duplicate meta tags
**Problem**: Same meta tag appears twice
**Solution**: Remove from index.html if managed by SEO component

### Social preview not showing
**Problem**: Facebook/Twitter not showing preview
**Solution**: Use debugger tools to refresh cache

### Poor performance score
**Problem**: Lighthouse score < 90
**Solution**: 
- Optimize images
- Reduce JavaScript bundle size
- Use code splitting
- Enable caching

## 📈 Monitoring

### Google Search Console
1. Add property for aiforjob.ai
2. Submit sitemap.xml
3. Monitor index coverage
4. Check mobile usability
5. Review search performance

### Analytics
- Track organic search traffic
- Monitor bounce rate
- Check average session duration
- Review top landing pages
- Analyze keyword performance

## 🚨 Important Notes

- **Never** noindex public pages by mistake
- **Always** use HTTPS in production
- **Update** sitemap when structure changes
- **Test** social sharing before launch
- **Monitor** Core Web Vitals regularly
- **Keep** content fresh and updated

## 📚 More Resources

- Full Guide: [SEO_GUIDE.md](SEO_GUIDE.md)
- Implementation Details: [SEO_IMPLEMENTATION.md](SEO_IMPLEMENTATION.md)
- Schema.org Reference: https://schema.org/
- Google SEO Starter Guide: https://developers.google.com/search/docs/beginner/seo-starter-guide

---

**Need help?** Check the full documentation or ask the team!
