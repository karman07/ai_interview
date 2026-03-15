import { Helmet } from 'react-helmet-async';

interface StructuredDataProps {
  data: object;
}

/**
 * Component to inject JSON-LD structured data for SEO
 */
const StructuredData = ({ data }: StructuredDataProps) => {
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(data)}
      </script>
    </Helmet>
  );
};

export default StructuredData;
