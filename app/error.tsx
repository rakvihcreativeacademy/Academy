"use client";
export default function ErrorPage({reset}:{error:Error;reset:()=>void}){return <main className="section narrow"><h1 className="page-title">Something went wrong.</h1><p className="body-copy mb-8">We couldn’t load this page. Please try again.</p><button className="button" onClick={reset}>Try again</button></main>;}
