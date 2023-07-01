import { base64Encode } from "https://deno.land/x/denomailer@1.6.0/deps.ts";
import "https://deno.land/x/dotenv/load.ts";

async function sendEmail(body: string) {
  try {
    const { TOKEN, FROM, TO, SBJ, API } = Deno.env.toObject();

    const response = await fetch(API, {
      method: "POST",
      headers: new Headers({
        "Authorization": `Basic ${base64Encode("api:" + TOKEN)}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }),
      body: `from=${FROM}&to=${TO}&subject=${SBJ}&text=${encodeURIComponent(body)}`,
    });

    const txt = await response.text();
    console.log(txt);

    console.log('Email sent!');
  } catch (error) {
    console.error(error);
  }
}

async function streamToString(stream: ReadableStream<Uint8Array>): Promise<string> {
  const decoder = new TextDecoder("utf-8");
  let result = '';
  const reader = stream.getReader();
  let chunk;

  while (!(chunk = await reader.read()).done) {
      result += decoder.decode(chunk.value || new Uint8Array, {stream: true});
  }

  result += decoder.decode(); // finish the stream

  return result;
}

// Start listening on port 8080 of localhost.
const server = Deno.listen({ port: 80 });
console.log(`HTTP webserver running.  Access it at:  http://localhost:80/`);

// Connections to the server will be yielded up as an async iterable.
for await (const conn of server) {
  // In order to not be blocking, we need to handle each connection individually
  // without awaiting the function
  serveHttp(conn);
}

async function serveHttp(conn: Deno.Conn) {
  // This "upgrades" a network connection into an HTTP connection.
  const httpConn = Deno.serveHttp(conn);
  // Each request sent over the HTTP connection will be yielded as an async
  // iterator from the HTTP connection.
  for await (const requestEvent of httpConn) {

    const body: string = await streamToString(requestEvent.request.body!);
    await sendEmail(body);

    // The native HTTP server uses the web standard `Request` and `Response`
    // objects.
    // const body = `Your user-agent is:\n\n${
    //   requestEvent.request.headers.get("user-agent") ?? "Unknown"
    // }`;
    // The requestEvent's `.respondWith()` method is how we send the response
    // back to the client.
    requestEvent.respondWith(
      new Response(body, {
        status: 200,
      }),
    );
  }
}