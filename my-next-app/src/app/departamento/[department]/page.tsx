// src/app/departamento/[department]/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { gql } from "@apollo/client";
import client from "../../../lib/apolloClient";
import Card from "@/components/Card";
import Link from "next/link";

// Forzamos la renderización dinámica (SSR) y deshabilitamos la caché
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

// Actualizamos la query global para incluir shareImage y siteName
const GLOBAL_SEO_QUERY = gql`
  query Global {
    global {
      favicon {
        url
      }
      shareImage {
        url
      }
      siteName
    }
  }
`;

// Query para obtener los departamentos con sus convocatorias
const GET_DEPARTAMENTOS = gql`
  query ConvocatoriasByDepartment($filters: DepartamentoFiltersInput) {
    departamentos(filters: $filters) {
      convocatorias {
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
  }
`;

/**
 * Genera los metadatos para la página del departamento.
 * Se utiliza el nombre del departamento para construir el título y la descripción,
 * y se obtiene el favicon, shareImage y siteName desde la configuración global
 * para establecer el ícono y la OG card para Facebook.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ department: string }>;
}): Promise<Metadata> {
  // Esperamos a que params se resuelva
  const { department } = await params;
  try {
    const { data: globalData } = await client.query({
      query: GLOBAL_SEO_QUERY,
      fetchPolicy: "no-cache",
    });
    const favicon = globalData?.global?.favicon?.url;
    const shareImage = globalData?.global?.shareImage?.url;
    const siteName = globalData?.global?.siteName;

    return {
      title: `Convocatorias para el departamento de ${department}`,
      description: `Encuentra las convocatorias disponibles para el departamento de ${department}.`,
      icons: {
        icon: `${process.env.NEXT_PUBLIC_STRAPI_URL}${favicon || "/favicon.ico"}`,
      },
      openGraph: {
        title: `Convocatorias para el departamento de ${department}`,
        description: `Encuentra las convocatorias disponibles para el departamento de ${department}.`,
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/departamento/${department}`,
        type: "website",
        images: shareImage
          ? [
              {
                url: `${process.env.NEXT_PUBLIC_STRAPI_URL}${shareImage}`,
                width: 1200,
                height: 630,
                alt: `Convocatorias para el departamento de ${department}`,
              },
            ]
          : [],
        siteName: siteName,
      },
    };
  } catch (error) {
    console.error("Error fetching global SEO data:", error);
    return {
      title: `Convocatorias para el departamento de ${department}`,
      description: `Encuentra las convocatorias disponibles para el departamento de ${department}.`,
    };
  }
}

/**
 * Componente principal que obtiene y muestra las convocatorias del departamento.
 */
export default async function DepartmentPage({
  params,
}: {
  params: Promise<{ department: string }>;
}) {
  // Esperamos a que params se resuelva
  const { department } = await params;

  const { data } = await client.query({
    query: GET_DEPARTAMENTOS,
    fetchPolicy: "no-cache",
    variables: {
      filters: { title: { contains: department } },
    },
  });

  if (!data.departamentos || data.departamentos.length === 0) {
    return notFound();
  }

  // Asumimos que queremos las convocatorias del primer departamento que coincida
  const convocatorias = data.departamentos[0].convocatorias;
  if (!convocatorias || convocatorias.length === 0) {
    return notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">
        Convocatorias para el departamento de {department}
      </h1>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {convocatorias.map((conv: any) => (
          <Link key={conv.slug} href={`/${conv.slug}`}>
            <Card conv={conv} />
          </Link>
        ))}
      </div>
    </div>
  );
}
