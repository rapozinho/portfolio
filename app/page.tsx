import Entry from "@/components/Entry";
import Header from "@/components/Header";
import Site from "@/components/Site";

export default function Home() {
  return (
    <>
      {/* Act II background: the 2D band wall, behind the content the whole way. */}
      <canvas id="wall-c" aria-hidden="true" />
      <div id="grain" aria-hidden="true" />
      <div id="veil" aria-hidden="true" />

      <Header />
      <Entry />
      <Site />
    </>
  );
}
