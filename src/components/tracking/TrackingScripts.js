import Script from 'next/script';

/**
 * TrackingScripts Component
 * 
 * Centralized location for all analytics and tracking scripts.
 * This component handles:
 * - Google Analytics (gtag.js) - Loads immediately after <head> element
 * - Google Tag Manager (future)
 * - Meta Pixel (future)
 * - Microsoft Clarity (future)
 * - Custom tracking scripts (future)
 * 
 * Note: beforeInteractive strategy requires this to be a Server Component
 * (no 'use client' directive) to inject scripts in <head> immediately.
 */

export default function TrackingScripts() {
  // Google Analytics ID
  const GA_MEASUREMENT_ID = 'G-TC1QKWDH1D';

  return (
    <>
      {/* Google Analytics (gtag.js) - Loads immediately after <head> element */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="beforeInteractive"
      />
      <Script id="google-analytics" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>

      {/* 
        ============================================
        FUTURE TRACKING SCRIPTS - ADD BELOW
        ============================================
        
        Example templates for adding more tracking scripts:
        
        --- Google Tag Manager ---
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-XXXXXXX');
          `}
        </Script>
        
        --- Meta Pixel (Facebook Pixel) ---
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', 'YOUR_PIXEL_ID');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img height="1" width="1" style={{display:'none'}}
            src="https://www.facebook.com/tr?id=YOUR_PIXEL_ID&ev=PageView&noscript=1"
          />
        </noscript>
        
        --- Microsoft Clarity ---
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "YOUR_CLARITY_ID");
          `}
        </Script>
        
        --- Custom Tracking Script ---
        <Script id="custom-tracking" strategy="afterInteractive">
          {`
            // Your custom tracking code here
            console.log('Custom tracking initialized');
          `}
        </Script>
      */}
    </>
  );
}
