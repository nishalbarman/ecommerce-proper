export async function fetchProducts({
  page = 0,
  limit = 25,
  searchParams = {},
  filter = undefined,
  sort = undefined,
  cookies = undefined,
}) {
  try {
    // await new Promise((res) => {
    //   setTimeout(() => {
    //     res(true);
    //   }, 10000);
    // });
    const backendUrl = process.env.NEXT_PUBLIC_DOMAIN_URL;

    const url = new URL(`/api/proxy/products`, backendUrl);

    url.searchParams.append("page", page);
    url.searchParams.append("limit", limit);

    if (!!searchParams.category) {
      url.searchParams.append("category", searchParams.category);
    }

    if (!!searchParams.searchValue) {
      url.searchParams.append("query", searchParams.searchValue);
    }

    if (!!searchParams.defaultSort) {
      url.searchParams.append("sort", searchParams.defaultSort);
    } else if (!!sort) {
      url.searchParams.append("sort", sort);
    }

    if (!!filter) {
      url.searchParams.append(
        "filter",
        encodeURIComponent(JSON.stringify(filter))
      );
    }

    const res = await fetch(url.href, {
      credentials: "include",
      headers: {
        method: "GET",
        Cookie: cookies,
      },
    });
    return res.json();
  } catch (error) {
    console.error(error.message);
  }
}
