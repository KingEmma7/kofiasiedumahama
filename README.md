# Kofi Asiedu Mahama - Author Landing Page

A beautiful, high-performance landing page built with Next.js 14, React, Tailwind CSS, and Framer Motion. Inspired by [stevenbartlett.com](https://stevenbartlett.com/).

![Preview](./public/og-image.jpg)

## ✨ Features

- **Modern Design**: Clean, professional aesthetic with smooth animations
- **Dark Mode**: System-aware with manual toggle
- **Responsive**: Mobile-first design that looks great on all devices
- **Payment Integration**: Secure Paystack checkout with bundle upsells
- **Secure Downloads**: Time-limited signed URLs for digital products
- **Newsletter**: Mailchimp/ConvertKit integration ready
- **SEO Optimized**: Meta tags, structured data, and Open Graph
- **Performance**: Next.js 14 with SSG, optimized images, lazy loading
- **Accessibility**: ARIA labels, keyboard navigation, focus states

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone or navigate to the project
cd kofiasiedumahama

# Install dependencies
npm install

# Create environment file
cp env.example.txt .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## ⚙️ Configuration

### Environment Variables

Copy `env.example.txt` to `.env.local` and fill in your values:

```env
# Paystack (required for payments)
NEXT_PUBLIC_PAYSTACK_KEY=pk_test_xxxxx
PAYSTACK_SECRET_KEY=sk_test_xxxxx

# Download security
DOWNLOAD_SECRET=your-random-secret-key

# Newsletter (choose one)
MAILCHIMP_API_KEY=xxxxx
MAILCHIMP_LIST_ID=xxxxx
MAILCHIMP_DC=us1

# Or ConvertKit
CONVERTKIT_API_KEY=xxxxx
CONVERTKIT_FORM_ID=xxxxx

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Site
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_BOOK_PRICE=50
NEXT_PUBLIC_BUNDLE_PRICE=75
```

### Paystack Setup

1. Create account at [paystack.com](https://paystack.com)
2. Get API keys from Dashboard > Settings > Developer
3. Add webhook: `https://yourdomain.com/api/webhook/paystack`

### Newsletter Setup

**Mailchimp:**
1. Get API key from Account > Extras > API keys
2. Find List ID in Audience > Settings > Audience name and defaults

**ConvertKit:**
1. Get API key from Settings > Advanced
2. Create form and get ID from URL

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   ├── download/          # Secure file downloads
│   │   ├── newsletter/        # Email subscriptions
│   │   ├── verify-payment/    # Payment verification
│   │   └── webhook/paystack/  # Payment webhooks
│   ├── globals.css            # Tailwind + custom styles
│   ├── layout.tsx             # Root layout with metadata
│   ├── loading.tsx            # Loading state
│   ├── not-found.tsx          # 404 page
│   └── page.tsx               # Main landing page
├── components/
│   ├── Analytics.tsx          # Google Analytics
│   ├── BioTimeline.tsx        # Vertical timeline
│   ├── BookSection.tsx        # Book showcase
│   ├── Footer.tsx             # Footer + newsletter
│   ├── Hero.tsx               # Hero with parallax
│   ├── NewsSection.tsx        # News/updates
│   ├── PaymentSection.tsx     # Paystack checkout
│   ├── ThemeProvider.tsx      # Dark mode context
│   └── ThemeToggle.tsx        # Theme switch button
├── public/
│   ├── book.pdf               # Your book file
│   ├── robots.txt
│   └── site.webmanifest
└── tailwind.config.ts
```

## 🎨 Customization

### Updating Content

1. **Hero Section** (`components/Hero.tsx`):
   - Update name, title, and book information
   - Replace placeholder image with your photo

2. **Timeline** (`components/BioTimeline.tsx`):
   - Edit `timelineEvents` array with your life events

3. **Book Section** (`components/BookSection.tsx`):
   - Update book title, description, and features
   - Add real testimonials
   - Configure affiliate links

4. **Pricing** (`components/PaymentSection.tsx`):
   - Adjust prices in environment variables
   - Modify bundle items

### Styling

- **Colors**: Edit `tailwind.config.ts` for primary/accent colors
- **Fonts**: Change fonts in `app/layout.tsx`
- **Animations**: Modify Framer Motion settings in components

### Adding Images

1. Add images to `public/images/`
2. Use Next.js Image component:

```tsx
import Image from 'next/image';

<Image
  src="/images/your-photo.jpg"
  alt="Description"
  width={400}
  height={400}
  priority
/>
```

## 📚 Moving Book to S3 (Recommended for Production)

For better security and scalability:

1. Create S3 bucket with private access
2. Install AWS SDK: `npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner`
3. Update `app/api/download/route.ts` (see comments in file)
4. Add AWS credentials to environment

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect repo to [vercel.com](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📊 Performance

Target Lighthouse scores: 90+ across all metrics

Optimizations included:
- Static generation (SSG)
- Image optimization via Next.js
- Code splitting
- Font optimization
- Lazy loading
- Minification

Run audits:
```bash
npm run build
npm start
# Then run Lighthouse in Chrome DevTools
```

## 🔒 Security

- HTTPS via Vercel (automatic)
- Signed download URLs with expiration
- Payment verification on backend
- Input validation
- CORS protection
- Webhook signature verification

## 📄 License

MIT - Feel free to use this for your own author landing page!

---

Built with ❤️ in Ghana

