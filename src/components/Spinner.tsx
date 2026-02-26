export const Spinner = ({ size = 16 }: { size?: number }) => (
  <span
    className="inline-block border-2 border-primary-foreground border-t-transparent rounded-full"
    style={{ width: size, height: size, animation: "spin .8s linear infinite" }}
  />
);
