import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const p = await params;
  //   const sP = await searchParams;
  //   console.log("what are search params", sP)
  return handleRequest(req, p, "GET");
}

export async function POST(req, { params }) {
  const p = await params;
  return handleRequest(req, p, "POST");
}

export async function PATCH(req, { params }) {
  const p = await params;
  return handleRequest(req, p, "PATCH");
}

export async function DELETE(req, { params }) {
  const p = await params;
  return handleRequest(req, p, "DELETE");
}

async function handleRequest(req, params, method) {
  console.log("what are params", params);
  const path = params.path.join("/");

  // ✅ GET full URL from request
  const { search } = new URL(req.url);

  const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/${path}${search}`;

  console.log("What is the url", url);

  // Get cookies from client request
  const cookie = req.headers.get("cookie");

  let body = null;
  if (method !== "GET") {
    body = await req.text();
  }

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(cookie && { cookie }), // ✅ forward cookies
    },
    body,
  });

  const data = await response.text();

  const res = new NextResponse(data, {
    status: response.status,
  });

  // Forward set-cookie from backend
  const setCookie = response.headers.get("set-cookie");
  if (setCookie) {
    res.headers.set("set-cookie", setCookie);
  }

  return res;
}
