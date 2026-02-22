export default function Spinner({ size = 8 }) {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[100px]">
      <div
        className={`w-${size} h-${size} border-4 border-blue-500 border-t-transparent rounded-full animate-spin`}
      />
    </div>
  );
}
