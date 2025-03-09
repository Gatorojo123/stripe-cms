// src/app/convocatoria/[slug]/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { gql } from "@apollo/client";
import client from "../../../lib/apolloClient";
import { BlocksRenderer } from "@strapi/blocks-react-renderer";
import Link from "next/link";

// Forzamos la renderización dinámica (SSR)
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const GET_CONVOCATORIA_BY_SLUG = gql`
  query ConvocatoriaBySlug($filters: ConvocatoriaFiltersInput) {
    convocatorias(filters: $filters) {
      title
      metaTitle
      description
      metaDescription
      slug
      logo {
        url
      }
      cover {
        url
      }
      content
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
      createdAt
      updatedAt
      publishedAt
    }
  }
`;

/**
 * Genera los metadatos para la página de convocatoria, incluyendo la OG card para Facebook.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  // Esperamos a que params se resuelva antes de usarlo
  const { slug } = await params;
  const { data } = await client.query({
    query: GET_CONVOCATORIA_BY_SLUG,
    fetchPolicy: "no-cache",
    variables: { filters: { slug: { eq: slug } } },
  });
  
  if (!data.convocatorias || data.convocatorias.length === 0) {
    return { title: "Not Found" };
  }
  
  const conv = data.convocatorias[0];
  return {
    title: conv.metaTitle || conv.title,
    description: conv.metaDescription || conv.description,
    // Agregamos la OG card para Facebook
    openGraph: {
      title: conv.metaTitle || conv.title,
      description: conv.metaDescription || conv.description,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/convocatoria/${conv.slug}`,
      type: "article",
      images: conv.cover?.url
        ? [
            {
              url: `${process.env.NEXT_PUBLIC_STRAPI_URL}${conv.cover.url}`,
              width: 1200,
              height: 630,
              alt: conv.metaTitle || conv.title,
            },
          ]
        : [],
    },
    // Opcional: puedes agregar también los íconos
    icons: {
      icon: conv.logo?.url
        ? `${process.env.NEXT_PUBLIC_STRAPI_URL}${conv.logo.url}`
        : undefined,
    },
  };
}

/**
 * Componente principal que muestra la convocatoria.
 */
export default async function ConvocatoriaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data } = await client.query({
    query: GET_CONVOCATORIA_BY_SLUG,
    fetchPolicy: "no-cache",
    variables: { filters: { slug: { eq: slug } } },
  });

  if (!data.convocatorias || data.convocatorias.length === 0) {
    return notFound();
  }

  const conv = data.convocatorias[0];

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Título con logo al lado */}
      <div className="flex items-center gap-4 mb-4">
        {conv.logo && (
          <img
            src={`${process.env.NEXT_PUBLIC_STRAPI_URL}${conv.logo.url}`}
            alt="Logo"
            className="w-16 h-16 object-contain"
          />
        )}
        <h1 className="text-4xl font-extrabold text-gray-800">{conv.title}</h1>
      </div>

      <p className="text-lg text-gray-700 mb-6">{conv.description}</p>

      {/* Datos relevantes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <p className="text-sm text-gray-500">
          <strong>Organización:</strong>{" "}
          {conv.organizacion?.title || "No disponible"}
        </p>
        <p className="text-sm text-gray-500">
          <strong>Departamentos:</strong>{" "}
          {conv.departamentos?.map((dep: { title: string }) => dep.title).join(", ") ||
            "No disponible"}
        </p>
        <p className="text-sm text-gray-500">
          <strong>Carreras:</strong>{" "}
          {conv.carreras?.map((carr: { title: string }) => carr.title).join(", ") ||
            "No disponible"}
        </p>
        <p className="text-sm text-gray-500">
          <strong>Formaciones:</strong>{" "}
          {conv.formacions?.map((form: { title: string }) => form.title).join(", ") ||
            "No disponible"}
        </p>
        {conv.enddate && (
          <p className="text-sm text-gray-500 md:col-span-2">
            <strong>Finaliza:</strong>{" "}
            {new Date(conv.enddate).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Contenido adicional */}
      {conv.content &&
        Array.isArray(conv.content) &&
        conv.content.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 border-b border-gray-200 pb-4">
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 bg-gray-50 py-3 px-6 rounded-t-lg border border-b-0 border-gray-100">
                Detalles de la Convocatoria
              </h2>
            </div>
            <div
              className="bg-white p-6 md:p-8 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300
              [&_h1]:mb-6 [&_h1]:font-extrabold [&_h1]:text-3xl md:[&_h1]:text-5xl
              [&_h2]:mb-5 [&_h2]:font-bold [&_h2]:text-2xl md:[&_h2]:text-4xl
              [&_h3]:mb-4 [&_h3]:font-semibold [&_h3]:text-xl md:[&_h3]:text-3xl
              [&_p]:mb-4 [&_p]:text-gray-700 [&_p]:leading-relaxed
              [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6
              [&_a]:text-blue-600 [&_a]:underline hover:[&_a]:text-blue-800"
            >
              <BlocksRenderer content={conv.content} />
            </div>
          </div>
        )}
    </div>
  );
}
