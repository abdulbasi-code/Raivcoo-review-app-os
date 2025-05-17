import { RevButtons } from "@/components/ui/RevButtons";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="text-center justify-center mt-16 flex flex-col min-h-full mb-6">
      <h2
        className="text-[12rem] mb-[-3rem] font-bold tracking-tight text-transparent bg-clip-text 
                dark:bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)]
                bg-[linear-gradient(180deg,_#000_0%,_rgba(0,_0,_0,_0.00)_202.08%)]"
      >
        404
      </h2>
      <h2
        className="text-2xl font-bold tracking-tight text-transparent bg-clip-text 
                dark:bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)]
                bg-[linear-gradient(180deg,_#000_0%,_rgba(0,_0,_0,_0.00)_202.08%)]"
      >
        Page not found
      </h2>
      <p className="text-muted-foreground mb-3">
        The page you are looking for does not exist
      </p>
      <Link href="/">
        <RevButtons variant={"outline"} size={"lg"}>
          {" "}
          Return to Home{" "}
        </RevButtons>
      </Link>
    </div>
  );
}
