import { InfiniteSlider } from "@/components/motion-primitives/infinite-slider";
import { ProgressiveBlur } from "@/components/motion-primitives/progressive-blur";
export function InfiniteSliderBasic() {
  return (
    <div className="relative  w-full overflow-hidden">
      <InfiniteSlider className="mt-6" gap={24} reverse>
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Adobe_After_Effects_CC_icon.svg/2101px-Adobe_After_Effects_CC_icon.svg.png"
          alt="After effects logo"
          className="h-[120px] w-auto"
        />
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Adobe_Photoshop_CC_icon.svg/1051px-Adobe_Photoshop_CC_icon.svg.png"
          alt="Adobe Photoshop logo"
          className="h-[120px] w-auto"
        />
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Adobe_Premiere_Pro_CC_icon.svg/2101px-Adobe_Premiere_Pro_CC_icon.svg.png"
          alt="Adobe Premiere logo"
          className="h-[120px]  w-auto"
        />
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Adobe_Illustrator_CC_icon.svg/2101px-Adobe_Illustrator_CC_icon.svg.png"
          alt="Adobe_Illustrator logo"
          className="h-[120px] w-auto"
        />
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Adobe_Animate_CC_icon_%282020%29.svg/1200px-Adobe_Animate_CC_icon_%282020%29.svg.png"
          alt="Adobe_Animate logo"
          className="h-[120px] w-auto"
        />
      </InfiniteSlider>
      <ProgressiveBlur
        className="pointer-events-none absolute top-0 left-0 h-full w-[200px]"
        direction="left"
        blurIntensity={1}
      />
      <ProgressiveBlur
        className="pointer-events-none absolute top-0 right-0 h-full w-[200px]"
        direction="right"
        blurIntensity={1}
      />
    </div>
  );
}

export function ProgressiveBlurSlider() {
  return (
    <div className="relative h-[350px] w-full overflow-hidden">
      <InfiniteSlider className="flex h-full w-full items-center">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Adobe_After_Effects_CC_icon.svg/2101px-Adobe_After_Effects_CC_icon.svg.png"
          alt="After effects logo"
          className="h-[120px] w-auto"
        />
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Adobe_Photoshop_CC_icon.svg/1051px-Adobe_Photoshop_CC_icon.svg.png"
          alt="Adobe Photoshop logo"
          className="h-[120px] w-auto"
        />
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Adobe_Premiere_Pro_CC_icon.svg/2101px-Adobe_Premiere_Pro_CC_icon.svg.png"
          alt="Adobe Premiere logo"
          className="h-[120px]  w-auto"
        />
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Adobe_Illustrator_CC_icon.svg/2101px-Adobe_Illustrator_CC_icon.svg.png"
          alt="Adobe_Illustrator logo"
          className="h-[120px] w-auto"
        />
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Adobe_Animate_CC_icon_%282020%29.svg/1200px-Adobe_Animate_CC_icon_%282020%29.svg.png"
          alt="Adobe_Animate logo"
          className="h-[120px] w-auto"
        />
      </InfiniteSlider>
      <ProgressiveBlur
        className="pointer-events-none absolute top-0 left-0 h-full w-[200px]"
        direction="left"
        blurIntensity={1}
      />
      <ProgressiveBlur
        className="pointer-events-none absolute top-0 right-0 h-full w-[200px]"
        direction="right"
        blurIntensity={1}
      />
    </div>
  );
}
