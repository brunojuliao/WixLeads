import { base64Encode } from "https://deno.land/x/denomailer@1.6.0/deps.ts";

export async function sendEmail(body: string) {
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