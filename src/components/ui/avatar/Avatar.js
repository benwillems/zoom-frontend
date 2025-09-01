export const Avatar = ({ alt, src }) => (
    <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-300">
      <img src={src} alt={alt} className="object-cover w-full h-full" />
    </div>
  );