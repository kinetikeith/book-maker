import { useDropzone } from "react-dropzone";
import BookDisplay, { BookType } from "./components/BookDisplay";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";
import {
  Button,
  Input,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import FileSaver from "file-saver";
import { parse as pathParse } from "path-browserify";
import Psd from "@webtoon/psd";
import { CheckIcon } from "@heroicons/react/16/solid";

/* https://stackoverflow.com/questions/18650168/convert-blob-to-base64 */
function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

async function psdToDataUrl(blob: Blob): Promise<string> {
  const psdFile = Psd.parse(await blob.arrayBuffer());
  const compositeBuffer = await psdFile.composite();
  const imageData = new ImageData(
    compositeBuffer,
    psdFile.width,
    psdFile.height,
  );

  const offscreen = new OffscreenCanvas(psdFile.width, psdFile.height);
  const context = offscreen.getContext("2d");

  context?.putImageData(imageData, 0, 0);
  return await blobToDataUrl(
    await offscreen.convertToBlob({ type: "image/png" }),
  );
}

async function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob !== null) resolve(blob);
      else throw new Error("Canvas failed blob conversion");
    }, "image/png");
  });
}

const defaultCover = "template-cover.png";
const defaultSpine = "template-spine.png";

const bookTypeLabels = new Map<BookType, string>([
  [BookType.PerfectBound, "Perfect bound"],
  [BookType.Hardcover, "Hardcover"],
  [BookType.Saddlestitch, "Saddlestitch"],
]);

export default function App() {
  const coverInputRef = useRef<HTMLInputElement>(null);
  const spineInputRef = useRef<HTMLInputElement>(null);
  const [coverUrl, setCoverUrl] = useState(defaultCover);
  const [spineUrl, setSpineUrl] = useState(defaultSpine);
  const [backColor, setBackColor] = useState("#3db999");
  const [backColorTemp, setBackColorTemp] = useState("#3db999");
  const [bookType, setBookType] = useState<BookType>(BookType.PerfectBound);

  const [fileName, setFileName] = useState("Untitled");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setBackColorTemp(backColor);
  }, [backColor]);

  const {
    getRootProps: getCoverRootProps,
    getInputProps: getCoverInputProps,
    isDragActive: isCoverDragActive,
  } = useDropzone({
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];

      console.log(file?.type);
      if (file?.type === "image/png") {
        setCoverUrl(await blobToDataUrl(file));
      } else if (
        ["image/vnd.adobe.photoshop", "application/x-photoshop"].includes(
          file?.type,
        )
      ) {
        setCoverUrl(await psdToDataUrl(file));
      }

      setFileName(pathParse(file.name).name);

      if (coverInputRef.current !== null) coverInputRef.current.value = "";
    },
    accept: {
      "image/vnd.adobe.photoshop": [".psd"],
      "application/x-photoshop": [".psd"],
      "image/png": [".png"],
    },
    noClick: true,
    noKeyboard: true,
  });

  const {
    getRootProps: getSpineRootProps,
    getInputProps: getSpineInputProps,
    isDragActive: isSpineDragActive,
  } = useDropzone({
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];

      if (file?.type === "image/png") {
        setSpineUrl(await blobToDataUrl(file));
      } else if (
        ["image/vnd.adobe.photoshop", "application/x-photoshop"].includes(
          file?.type,
        )
      ) {
        setSpineUrl(await psdToDataUrl(file));
      }

      if (spineInputRef.current !== null) spineInputRef.current.value = "";
    },
    accept: {
      "image/vnd.adobe.photoshop": [".psd"],
      "application/x-photoshop": [".psd"],
      "image/png": [".png"],
    },
    noClick: true,
    noKeyboard: true,
  });

  const isDragActive = isCoverDragActive || isSpineDragActive;

  const triggerDownload = useCallback(async () => {
    const canvas: HTMLCanvasElement | null = document.querySelector("canvas");
    console.log(document.querySelectorAll("canvas"));
    if (canvas !== null)
      FileSaver.saveAs(await canvasToBlob(canvas), `${fileName}.png`);
  }, [fileName]);

  const triggerCopy = useCallback(async () => {
    const canvas: HTMLCanvasElement | null = document.querySelector("canvas");
    if (canvas !== null) {
      try {
        await navigator.clipboard.write([
          new ClipboardItem({
            "image/png": canvasToBlob(canvas),
          }),
        ]);
        setCopied(true);
      } catch (error) {
        console.error(error);
      }
    }
  }, []);

  const coverExists = coverUrl !== defaultCover;
  const spineExists = spineUrl !== defaultSpine;

  return (
    <>
      <section className="fixed right-4 top-4 flex flex-col items-stetch space-y-4 bg-gray-900 p-4 rounded-xl w-80">
        <div>
          <label
            htmlFor="book_type"
            className="block mb-2 text-sm font-medium text-white"
          >
            Book Type
          </label>
          <div className="relative">
            <Listbox value={bookType} onChange={setBookType}>
              <ListboxButton className="border text-sm rounded-lg block w-full text-left p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500">
                {bookTypeLabels.get(bookType)}
              </ListboxButton>
              <ListboxOptions className="absolute inset-x-0 top-0 border text-sm rounded-lg block overflow-clip w-full bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500">
                {[...bookTypeLabels.entries()].map(([bookType, label]) => (
                  <ListboxOption
                    value={bookType}
                    key={bookType}
                    className="p-2.5 hover:bg-gray-800 cursor-pointer"
                  >
                    {label}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </Listbox>
          </div>
        </div>
        <div
          data-success={coverExists ? true : undefined}
          className="flex items-center justify-center h-full text-gray-500 data-[success]:text-green-400"
        >
          <label
            {...getCoverRootProps({
              className:
                "flex flex-col items-center justify-center transition-colors border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-800 bg-gray-900 hover:bg-gray-100 border-gray-600 hover:border-gray-500 w-full",
            })}
          >
            <div className="flex flex-col items-center justify-center py-4 px-6">
              <div
                data-success={coverExists ? true : undefined}
                className="text-lg font-bold flex flex-row items-center gap-1"
              >
                Cover {coverExists ? <CheckIcon className="size-6" /> : null}
              </div>
              {isDragActive ? (
                <p className="mb-2 text-sm">Drop Cover Here</p>
              ) : (
                <p
                  data-success={coverExists ? true : undefined}
                  className="mb-2 text-sm data-[success]:hidden"
                >
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
              )}
            </div>
            <input {...getCoverInputProps()} ref={coverInputRef} />
          </label>
        </div>
        {[BookType.PerfectBound, BookType.Hardcover].includes(bookType) ? (
          <div
            data-success={spineExists ? true : undefined}
            className="flex items-center justify-center h-full text-gray-500 data-[success]:text-green-400"
          >
            <label
              {...getSpineRootProps({
                className:
                  "flex flex-col items-center justify-center transition-colors border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-800 bg-gray-900 hover:bg-gray-100 border-gray-600 hover:border-gray-500 w-full",
              })}
            >
              <div className="flex flex-col items-center justify-center py-4 px-6 data-[success]">
                <div className="text-lg font-bold flex flex-row items-center gap-1">
                  Spine {spineExists ? <CheckIcon className="size-6" /> : null}
                </div>
                {isDragActive ? (
                  <p className="mb-2 text-sm">Drop spine Here</p>
                ) : (
                  <p
                    data-success={spineExists ? true : undefined}
                    className="mb-2 text-sm data-[success]:hidden"
                  >
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                )}
              </div>
              <input {...getSpineInputProps()} ref={spineInputRef} />
            </label>
          </div>
        ) : null}
        {bookType === BookType.Hardcover ? (
          <div className="space-y-4">
            <label
              htmlFor="color_hex"
              className="block mb-2 text-sm font-medium text-white"
            >
              Back Cover
            </label>
            <HexColorPicker color={backColor} onChange={setBackColor} />
            <Input
              type="text"
              id="color_hex"
              className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
              placeholder="#ffffff"
              value={backColorTemp}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                const value = event.target.value;
                if (value.length > 7) return;
                if (/^#([0-9A-F]{3}){1,2}$/i.test(value)) setBackColor(value);
                setBackColorTemp(value);
              }}
            />
          </div>
        ) : null}
        <Button
          onClick={triggerDownload}
          className="text-white focus:ring-4 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-blue-800 w-full"
        >
          Download Image
        </Button>
        <Button
          onClick={triggerCopy}
          data-copied={copied ? true : undefined}
          className="text-blue-500 focus:ring-4 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 border bg-green-600/0 border-1 border-blue-500 hover:border-blue-300 hover:text-blue-300 focus:outline-none focus:ring-blue-800 w-full data-[copied=true]:border-transparent data-[copied=true]:text-white data-[copied=true]:bg-green-600 transition-colors duration-500"
        >
          Copy Image
        </Button>
      </section>
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <BookDisplay
          coverUrl={coverUrl}
          spineUrl={spineUrl}
          backColor={backColor}
          bookType={bookType}
        />
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center"></footer>
    </>
  );
}
