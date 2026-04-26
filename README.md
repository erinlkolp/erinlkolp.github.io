# erinlkolp-website

Personal site at https://erinlkolp.com. Built with Astro,
deployed to GitHub Pages.

## Local dev

    npm install
    npm run dev

## Build

    npm run build

## Tests

    npm test

## Writing a blog post

Posts live in `src/content/blog/` as `.mdx` files. Per-post images go in
`src/assets/blog/<slug>/` and are embedded with the `<PostImage>` component,
which renders an Astro-optimized image inside an ASCII terminal frame.

To start a new post:

    SLUG=my-new-post
    cp src/content/blog/_template.mdx src/content/blog/$SLUG.mdx
    mkdir src/assets/blog/$SLUG

Then in the new `.mdx` file:

1. Fill in the frontmatter (`title`, `description`, `pubDate`, `tags`).
2. Replace `REPLACE-WITH-POST-SLUG` with your slug in every `<PostImage>` call.
3. Drop any images into `src/assets/blog/<slug>/` and reference them by
   filename: `<PostImage slug="my-new-post" src="photo.png" alt="..." />`.
4. Set `draft: false` (or remove the line) when ready to publish.

Supported image formats: jpg, jpeg, png, gif, webp, avif, svg. A missing
image fails the build with `Image not found: src/assets/blog/<slug>/<file>`.
