import { useDropzone } from "react-dropzone";
import BookDisplay from "./components/BookDisplay";
import { useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";

/* https://stackoverflow.com/questions/18650168/convert-blob-to-base64 */
function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

export default function App() {
  const coverInputRef = useRef<HTMLInputElement>(null);
  const spineInputRef = useRef<HTMLInputElement>(null);
  const [coverUrl, setCoverUrl] = useState("/template-cover.png");
  const [spineUrl, setSpineUrl] = useState("/template-spine.png");
  const [backColor, setBackColor] = useState("#3db999");

  const {
    getRootProps: getCoverRootProps,
    getInputProps: getCoverInputProps,
    isDragActive,
  } = useDropzone({
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];

      if (file?.type === "image/png") {
        console.log("is png");
        setCoverUrl(await blobToDataUrl(file));
      } else if (file?.type === "image/vnd.adobe.photoshop") {
        console.log("is psd");
      }
    },
    accept: {
      //'image/vnd.adobe.photoshop': ['.psd'],
      "image/png": [".png"],
    },
    noClick: true,
    noKeyboard: true,
  });

  const { getRootProps: getSpineRootProps, getInputProps: getSpineInputProps } =
    useDropzone({
      onDrop: async (acceptedFiles) => {
        const file = acceptedFiles[0];

        if (file?.type === "image/png") {
          console.log("is png");
          setSpineUrl(await blobToDataUrl(file));
        } else if (file?.type === "image/vnd.adobe.photoshop") {
          console.log("is psd");
        }
      },
      accept: {
        //'image/vnd.adobe.photoshop': ['.psd'],
        "image/png": [".png"],
      },
      noClick: true,
      noKeyboard: true,
    });
  return (
    <>
      <section className="fixed right-4 top-4 flex flex-col items-center space-y-4 bg-gray-900 p-4 rounded-xl">
        <div className="flex items-center justify-center h-full">
          <label
            {...getCoverRootProps({
              className:
                "flex flex-col items-center justify-center transition-colors border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-900 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500",
            })}
          >
            <div className="flex flex-col items-center justify-center py-4 px-6">
              <div className="text-lg font-bold text-gray-500">Cover</div>
              {isDragActive ? (
                <p className="mb-2 text-sm text-gray-500">Drop Cover Here</p>
              ) : (
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
              )}
            </div>
            <input {...getCoverInputProps()} ref={coverInputRef} />
          </label>
        </div>
        <div className="flex items-center justify-center h-full">
          <label
            {...getSpineRootProps({
              className:
                "flex flex-col items-center justify-center transition-colors border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-900 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500",
            })}
          >
            <div className="flex flex-col items-center justify-center py-4 px-6">
              <div className="text-lg font-bold text-gray-500">Spine</div>
              {isDragActive ? (
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  Drop spine Here
                </p>
              ) : (
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
              )}
            </div>
            <input {...getSpineInputProps()} ref={spineInputRef} />
          </label>
        </div>
        <HexColorPicker color={backColor} onChange={setBackColor} />
      </section>
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <BookDisplay
          coverUrl={coverUrl}
          spineUrl={spineUrl}
          backColor={backColor}
        />
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center"></footer>
    </>
  );
}
