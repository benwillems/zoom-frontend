This is a [Next.js](https://nextjs.org/) project bootstrapped with[`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started 

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Reverse Proxy + ENV Files

#### Understanding the Reverse Proxy

NextJS provides the ability to setup a puesdo reverse proxy using [Rewrites](https://nextjs.org/docs/pages/api-reference/next-config-js/rewrites). In our case we are using `/api/proxy/:path` and conditionally rendering a different domain based off running the project in DEV or PROD.

Reference `next.config.js` to see the reverse proxy working. As the application grows new URLs will needed to be added to the `next.config.js` file.

There are several advantages to using a reverse proxy:

- `CORS` no longer becomes an issue because the browser thinks all requests come from the backend
- `HTTP-Only` Cookies within the browser also think the backend and frontend are `same-site` but the indeed different domains
- The backend `API` routes are protected because they live behind the `/api/proxy/:path` and we can customize this path however we want

#### ENV Files

There are two sample env files within the project. You will need to make these two files yourself and add the values to these env files yourself.

Create two files:

- `.env.development.local`
- `.env.production.local`

Depending on what environment you are running the project in it will use the related file. (i.e) `npm run dev` uses the `.env.development` file.

In the case you want to test a build but still use the development env file just change the production env file value to point to `localhost`.

## Deployment

Here are the steps to deploy to [Fly.io](https://fly.io/). These are the Fly.io [NextJS deployment docs](https://fly.io/docs/languages-and-frameworks/nextjs/) for reference.

1. Login to the correct account via the [flyctl](https://fly.io/docs/hands-on/install-flyctl/)
2. Create your [two env files](#env-files) on your machine within the root of the project.
3. Time to deploy - run `fly deploy` from the root of the project, it will take a few minutes as it's building a docker image and then push to Fly servers

#### ENV Variables

ENV variables have been setup for production deployment. For reference below is the documentation to discuss how ENV variables are setup for Fly.io production deployment.

https://fly.io/docs/languages-and-frameworks/nextjs/#em-what-about-build-time-environment-variables-em
