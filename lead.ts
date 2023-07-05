import "https://deno.land/x/dotenv/load.ts";
import { Application, Context } from 'https://deno.land/x/oak/mod.ts';
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import { sendEmail } from "./sendEmail.ts";
import { Router } from "https://deno.land/x/oak/mod.ts";
import { Status } from "https://deno.land/std@0.188.0/http/http_status.ts";

const APP_HOST = '127.0.0.1';
const APP_PORT = 80;

const router = new Router();

const captureLead = async (ctx: Context) => {
  try {
    const bodyReader = ctx.request.body({type: "text"});
    const body: string = await bodyReader.value; //await streamToString(ctx.request.body!);
    await sendEmail(body);

    ctx.response.body = 'Computed';
    ctx.response.status = Status.OK;
  }
  catch(e)
  {
    ctx.response.status = Status.InternalServerError;
    console.error(e);
    ctx.response.body = JSON.stringify(e);
  }
};

const test = (ctx: Context) => {
  ctx.response.body = 'Access allowed!';
  ctx.response.status = Status.OK;
}

router.get('/', test);
router.post('/', captureLead);

// Create Application Like Express
const app = new Application();

// Add Routes
app.use(oakCors({
  origin: /^.+kina-altodepinheiros.com.br$/,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
}),);
app.use(router.routes());

console.log(`App Started at Port ${APP_PORT}`);
await app.listen(`${APP_HOST}:${APP_PORT}`);