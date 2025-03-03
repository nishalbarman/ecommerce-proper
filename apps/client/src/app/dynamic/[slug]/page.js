const fetchDynamicContent = async (slug) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/dynamic-pages/${slug}`
  );
  const data = await response.json();
  return data;
};

export default async function ({ params }) {
  const slug = (await params).slug;
  const pageContent = await fetchDynamicContent(slug);

  return (
    <>
      <section className="text-gray-600 body-font">
        <div className="container px-5 py-4 md:py-24 mx-auto flex flex-col">
          <div className="lg:w-5/6 mx-auto">
            {pageContent?.cover && (
              <div className="rounded-lg h-64 overflow-hidden">
                <img
                  alt="content"
                  className="object-contain rounded-lg object-center h-full w-full"
                  src={pageContent?.cover}
                />
              </div>
            )}
            <div className="flex flex-col sm:flex-row mt-10">
              <div className="sm:w-1/3 text-center sm:pr-8 sm:py-8">
                {pageContent?.avatar && (
                  <div className="w-20 h-20 rounded-full inline-flex items-center justify-center bg-gray-200 text-gray-400">
                    <img
                      src={pageContent?.avatar}
                      className="object-contain h-full w-full rounded-full"
                    />
                  </div>
                )}
                <div className="flex flex-col items-center text-center justify-center">
                  {pageContent?.avatar && (
                    <div className="w-12 h-1 bg-indigo-500 rounded mt-2 mb-0" />
                  )}

                  <div className="text-left">
                    {pageContent?.shortDescription && (
                      <div className="prose lg:prose-lg text-left my-10 mt-0">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: pageContent?.shortDescription,
                          }}></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="sm:w-2/3 sm:pl-8 sm:py-8 sm:border-l border-gray-200 sm:border-t-0 border-t pt-10 sm:mt-0">
                {pageContent?.description && (
                  <div className="prose lg:prose-lg mx-auto mx-8">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: pageContent?.description,
                      }}></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
