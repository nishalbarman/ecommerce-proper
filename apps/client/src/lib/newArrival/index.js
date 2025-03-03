export async function fetchNewArrivals({
  page = 1,
  limit = 4,
  searchParams = {},
  filter = undefined,
  sort = undefined,
  cookies = undefined,
}) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_SERVER_URL;

    const url = new URL(`/new-arrival`, backendUrl);

    console.log("New Arrival", url.href);

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
      headers: {
        credentials: "include",
        method: "GET",
        Cookie: cookies,
      },
    });

    const data = await res.json();

    return data;
  } catch (error) {
    console.error(error.message);
  }
}
