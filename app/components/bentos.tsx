// app/home/bento.tsx
import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid";
import { InputIcon } from "@radix-ui/react-icons";
import { FileTextIcon, Globe } from "lucide-react";
import { AnimatedBeamDemo } from "./Home/Beams";
import { InfiniteSliderBasic } from "./Home/Infinite";

const features = [
  {
    Icon: FileTextIcon,
    name: "Direct Feedback Workflow",
    description:
      "A clean editor-to-client system that keeps feedback and revisions simple.",
    href: "/",
    cta: "Learn more",
    background: (
      <div className="flex justify-center h-full items-center">
        <AnimatedBeamDemo />
      </div>
    ),
    className: "lg:col-span-1 lg:row-span-1",
  },
  {
    Icon: InputIcon,
    name: "Adobe Extension Support",
    description:
      "Feedback inside Premiere Pro, After Effects, Animate, Illustrator, and Photoshop.",
    href: "/",
    cta: "Learn more",
    background: <InfiniteSliderBasic />,
    className: "lg:col-span-1 lg:row-span-1",
  },
  {
    Icon: Globe,
    name: "Automatic Revision Rounds",
    description:
      "Client comments trigger new revision rounds automatically. no manual setup needed.",
    href: "/",
    cta: "Learn more",
    background: (
      <video
        autoPlay
        loop
        muted
        src="/Loop Comp.mp4"
        className="absolute -top-20 opacity-60"
      />
    ),
    className: "lg:col-span-2 lg:row-span-1",
  },
];

export function BentoDemo() {
  return (
    <BentoGrid className="grid-cols-1 gap-4 lg:grid-cols-2">
      {features.map((feature) => (
        <BentoCard key={feature.name} {...feature} />
      ))}
    </BentoGrid>
  );
}
