// app/convocatorias/page.tsx (Server Component)
import { Metadata } from 'next';
import { gql } from '@apollo/client';
import client from '../lib/apolloClient';
import Link from 'next/link';
import Card from '../components/Card';

// Forzamos renderizado dinámico y deshabilitamos la caché para obtener datos actualizados en cada request
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

interface Convocatoria {
  title: string;
  metaTitle: string;
  description: string;
  metaDescription: string;
  slug: string;
  cover?: { url: string };
  createddate: string;
  enddate: string;
  organizacion: { title: string };
  departamentos: { title: string }[];
  carreras: { title: string }[];
  formacions: { title: string }[];
}

interface Data {
  convocatorias: Convocatoria[];
}

interface GlobalSEO {
  documentId: string;
  siteName: string;
  favicon: { url: string };
  siteDescription: string;
  metaTitle: string;
  metaDescription: string;
  shareImage: { url: string };
}

interface GlobalData {
  global: GlobalSEO;
}

// Query global para obtener metadatos
const GLOBAL_SEO_QUERY = gql`
  query Global {
    global {
      documentId
      siteName
      favicon {
        url
      }
      siteDescription
      metaTitle
      metaDescription
      shareImage {
        url
      }
    }
  }
`;

// Query para obtener las convocatorias activas
const GET_CONVOCATORIAS = gql`
  query Convocatorias($filters: ConvocatoriaFiltersInput) {
    convocatorias(filters: $filters) {
      title
      metaTitle
      description
      metaDescription
      slug
      cover {
        url
      }
      enddate
      organizacion {
        title
      }
      departamentos {
        title
      }
      carreras {
        title
      }
      formacions {
        title
      }
    }
  }
`;

/**
 * Genera los metadatos para la página.
 * Se utiliza la query global para obtener el favicon, shareImage y otros metadatos.
 */
export async function generateMetadata(): Promise<Metadata> {
  try {
    const { data: seoData } = await client.query<GlobalData>({
      query: GLOBAL_SEO_QUERY,
      fetchPolicy: 'no-cache',
    });
    const seo = seoData.global;
    return {
      title: seo.metaTitle || 'Convocatorias',
      description: seo.metaDescription || 'Descripción de convocatorias',
      icons: {
        icon: `${process.env.NEXT_PUBLIC_STRAPI_URL}${seo.favicon?.url}`,
      },
      openGraph: {
        title: seo.metaTitle,
        description: seo.metaDescription,
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/convocatorias`,
        type: 'website',
        images: seo.shareImage
          ? [
              {
                url: `${process.env.NEXT_PUBLIC_STRAPI_URL}${seo.shareImage.url}`,
                width: 1200,
                height: 630,
                alt: seo.metaTitle || 'Convocatorias',
              },
            ]
          : [],
        siteName: seo.siteName,
      },
    };
  } catch (error) {
    console.error('Error fetching SEO metadata:', error);
    return {
      title: 'Convocatorias',
      description: 'Descripción de convocatorias',
    };
  }
}

/**
 * Componente principal que obtiene y muestra las convocatorias vigentes.
 * Se filtran aquellas cuyo campo "enddate" sea mayor que la fecha actual.
 */
export default async function ConvocatoriasPage() {
  let convocatorias: Convocatoria[] = [];
  try {
    // Obtenemos la fecha actual en formato ISO para filtrar las convocatorias vigentes
    const currentDate = new Date().toISOString();
    const { data } = await client.query<Data>({
      query: GET_CONVOCATORIAS,
      fetchPolicy: 'no-cache',
      variables: {
        filters: {
          enddate: { gt: currentDate },
        },
      },
    });
    convocatorias = data.convocatorias;
  } catch (error) {
    console.error('Error fetching convocatorias:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Convocatorias</h1>
      {convocatorias.length > 0 ? (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {convocatorias.map((conv) => (
            <Link key={conv.slug} href={`/${conv.slug}`}>
              <Card conv={conv} />
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-center">No hay convocatorias disponibles.</p>
      )}
    </div>
  );
}
