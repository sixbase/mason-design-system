import { Breadcrumb, Heading, Text } from '@ds/components';
import './TermsDemo.css';

export function TermsDemo({ basePath = '' }: { basePath?: string }) {
  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Home', href: `${basePath}/examples/homepage` },
          { label: 'Terms & Conditions' },
        ]}
      />

      <div className="ds-legal-content">
        <div className="ds-legal-content__header">
          <Heading as="h1" size="2xl">Terms &amp; Conditions</Heading>
          <Text size="sm" muted>Last updated: March 15, 2026</Text>
        </div>

        <section>
          <Heading as="h2" size="xl">1. General Terms</Heading>
          <Text>
            By accessing and placing an order with Mason Supply Co., you confirm that you
            are in agreement with and bound by the terms of service contained in the Terms
            &amp; Conditions outlined below. These terms apply to the entire website and any
            email or other type of communication between you and Mason Supply Co.
          </Text>
          <Text>
            Under no circumstances shall the Mason Supply Co. team be liable for any direct,
            indirect, special, incidental, or consequential damages, including but not limited
            to loss of data or profit, arising out of the use, or the inability to use, the
            materials on this site, even if the Mason Supply Co. team or an authorized
            representative has been advised of the possibility of such damages.
          </Text>
        </section>

        <section>
          <Heading as="h2" size="xl">2. Products &amp; Services</Heading>
          <Text>
            All products and services are subject to availability. We reserve the right to
            discontinue any product at any time. Prices for our products are subject to change
            without notice. We shall not be liable to you or to any third-party for any
            modification, price change, suspension, or discontinuance of a product.
          </Text>
          <Heading as="h3" size="xl" className="ds-legal-content__h3">2.1 Product Descriptions</Heading>
          <Text>
            We have made every effort to display as accurately as possible the colors and
            images of our products that appear at the store. We cannot guarantee that your
            computer monitor&rsquo;s display of any color will be accurate. We do not warrant
            that the quality of any products, services, information, or other material
            purchased or obtained by you will meet your expectations.
          </Text>
          <Heading as="h3" size="xl" className="ds-legal-content__h3">2.2 Pricing</Heading>
          <Text>
            All prices are listed in USD unless otherwise stated. Prices are inclusive of
            applicable taxes where required by law. Shipping costs are calculated at checkout
            based on your delivery address and chosen shipping method.
          </Text>
        </section>

        <section>
          <Heading as="h2" size="xl">3. Shipping &amp; Delivery</Heading>
          <Text>
            We offer the following shipping options for domestic orders:
          </Text>
          <ul>
            <li>Standard Shipping (3&ndash;5 business days): Free on orders over $50</li>
            <li>Express Shipping (1&ndash;2 business days): $12.00</li>
            <li>Overnight Shipping (next business day): $25.00</li>
          </ul>
          <Text>
            International shipping is available to select countries. Delivery times vary
            by destination. Import duties and taxes may apply and are the responsibility
            of the customer.
          </Text>
        </section>

        <section>
          <Heading as="h2" size="xl">4. Returns &amp; Refunds</Heading>
          <Text>
            We accept returns within 30 days of delivery for unused items in their original
            packaging. To initiate a return, please contact our support team with your order
            number and reason for return.
          </Text>
          <Text>
            Refunds will be processed to the original payment method within 5&ndash;10 business
            days of receiving the returned item. Shipping costs are non-refundable unless the
            return is due to our error.
          </Text>
          <Heading as="h3" size="xl" className="ds-legal-content__h3">4.1 Exceptions</Heading>
          <Text>
            The following items cannot be returned:
          </Text>
          <ul>
            <li>Items marked as final sale</li>
            <li>Personalized or custom-made products</li>
            <li>Gift cards</li>
            <li>Items showing signs of wear or damage not caused during shipping</li>
          </ul>
        </section>

        <section>
          <Heading as="h2" size="xl">5. Privacy Policy</Heading>
          <Text>
            Your privacy is important to us. We collect and use your personal information only
            as described in this section. We collect information you provide directly to us,
            such as when you create an account, place an order, sign up for our newsletter, or
            contact us for support.
          </Text>
          <Text>
            We do not sell your personal information to third parties. We may share your
            information with service providers who assist us in operating our website,
            conducting our business, or serving you, provided that those parties agree to keep
            this information confidential.
          </Text>
        </section>

        <section>
          <Heading as="h2" size="xl">6. Intellectual Property</Heading>
          <Text>
            All content on this website, including but not limited to text, graphics, logos,
            images, and software, is the property of Mason Supply Co. and is protected by
            applicable copyright and trademark laws. You may not reproduce, distribute,
            modify, or create derivative works of any material on this site without our
            express written consent.
          </Text>
        </section>

        <section>
          <Heading as="h2" size="xl">7. Contact Information</Heading>
          <Text>
            If you have any questions about these Terms &amp; Conditions, please contact us at:
          </Text>
          <Text>
            Mason Supply Co.<br />
            123 Artisan Way, Portland, OR 97201<br />
            Email: <a href="mailto:support@masonsupply.co">support@masonsupply.co</a><br />
            Phone: (503) 555-0142
          </Text>
        </section>
      </div>
    </div>
  );
}
