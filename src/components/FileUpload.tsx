import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Field,
  Input,
  Label,
  Transition,
} from "@headlessui/react";
import { CloudArrowDownIcon } from "@heroicons/react/24/outline";
import { useCallback, useMemo, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";

function FileUploadDialog({
  file,
  isOpen,
  onCloseAll,
  onFinished,
  index,
  totalFileNum,
}: {
  file: File;
  isOpen: boolean;
  onCloseAll: () => void;
  onFinished: () => void;
  index: number;
  totalFileNum: number;
}) {
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const [fileStem, fileExt] = useMemo(() => {
    const index = file.name.lastIndexOf(".");
    return [file.name.slice(0, index), file.name.slice(index)];
  }, [file]);

  const [label, setLabel] = useState(fileStem);

  const labelSafe = useMemo(() => {
    const labelUnder = label.replace(/\s/g, "_");
    return labelUnder.replace(/[^a-zA-Z0-9-_]/g, "");
  }, [label]);

  return (
    <Transition
      show={isOpen}
      appear={true}
      unmount={false}
      as={Dialog}
      onClose={() => onCloseAll()}
      className="relative z-50"
    >
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4 backdrop-blur-2xl data-[closed]:opacity-0 transition-opacity duration-500">
        <DialogPanel
          transition
          className="w-full max-w-lg space-y-4 border-[1px] border-gray-700 rounded-xl bg-gray-950/60 p-12 duration-500 ease-in-out transition-all data-[closed]:scale-90 data-[closed]:opacity-0"
        >
          <DialogTitle className="font-regular text-2xl flex flex-row justify-between items-baseline">
            Upload File
            {totalFileNum > 1 ? (
              <span className="text-sm font-light">
                ({index + 1}/{totalFileNum})
              </span>
            ) : null}
          </DialogTitle>
          <div className="w-full max-w-md space-y-5">
            <Field>
              <Label className="text-sm/6 font-medium text-white">Label</Label>
              <Input
                className="mt-3 block w-full rounded-lg border-none bg-white/5 py-1.5 px-3 text-sm/6 text-white focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25"
                name="file_label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                type="text"
                required
              />
            </Field>
            <Field>
              <Label className="text-sm/6 font-medium text-white">
                File Name
              </Label>
              <Input
                className="mt-3 block w-full rounded-lg border-none bg-white/5 py-1.5 px-3 text-sm/6 text-white focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25"
                name="file_label"
                placeholder={`${labelSafe}${fileExt}`}
                type="text"
              />
            </Field>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-10 dark:bg-gray-700 relative mt-12">
            <div
              className="relative bg-blue-600 h-full rounded-full transition-all duration-700 min-w-10"
              style={{ width: "1%" }}
            ></div>
            <div className="absolute inset-0 flex flex-col justify-center items-center">
              45%
            </div>
            <button
              onClick={() => {
                setIsUploading(true);
                setTimeout(() => onFinished(), 2000);
              }}
              data-uploading={isUploading}
              disabled={isUploading}
              className="absolute inset-0 flex flex-row rounded-full justify-center items-center bg-green-500 text-gray-900 font-semibold duration-700 data-[uploading=true]:opacity-0 transition-opacity"
            >
              <div className="flex flex-row justify-center items-baseline gap-2">
                Upload
                <span className="font-light text-sm">
                </span>
              </div>
            </button>
          </div>
        </DialogPanel>
      </div>
    </Transition>
  );
}

export default function FileUpload() {
  const [currentFiles, setCurrentFiles] = useState<File[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentFile = currentFiles[currentIndex];
  const inputRef = useRef<HTMLInputElement>(null);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setCurrentFiles(acceptedFiles);
      setCurrentIndex(0);
    },
    noClick: true,
    noKeyboard: true,
  });

  const clearFiles = useCallback(() => {
    setCurrentFiles([]);
    setCurrentIndex(0);
    if (inputRef.current !== null) inputRef.current.value = "";
  }, []);

  return (
    <>
      {currentFiles.map((file, index) => (
        <FileUploadDialog
          file={file}
          isOpen={file === currentFile}
          onFinished={() => {
            const newIndex = currentIndex + 1;
            setCurrentIndex(newIndex);
            if (newIndex >= currentFiles.length) {
              setTimeout(() => clearFiles(), 500);
            }
          }}
          onCloseAll={() => { }}
          index={index}
          totalFileNum={currentFiles.length}
          key={index}
        />
      ))}
      <h1 className="text-6xl text-center font-thin">AWS S3 Uploader</h1>
      <div className="flex flex-row items-center space-x-4">
        <div className="flex items-center justify-center h-full">
          <label
            {...getRootProps({
              className:
                "flex flex-col items-center justify-center transition-colors border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-900 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500",
            })}
          >
            <div className="flex flex-col items-center justify-center py-8 px-6 space-y-2">
              <div className="text-lg font-bold text-gray-500">Cover</div>
              {isDragActive ? (
                <p className="mb-2 text-sm text-gray-500">
                  Drop Cover Here
                </p>
              ) : (
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
              )}
            </div>
            <input {...getInputProps()} ref={inputRef} />
          </label>
        </div>
        <div className="flex items-center justify-center h-full">
          <label
            {...getRootProps({
              className:
                "flex flex-col items-center justify-center transition-colors border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-900 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500",
            })}
          >
            <div className="flex flex-col items-center justify-center py-8 px-6 space-y-2">
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
            <input {...getInputProps()} ref={inputRef} />
          </label>
        </div>
      </div>
    </>
  );
}
