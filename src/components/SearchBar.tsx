import useS3Client from "@/services/aws";
import { _Object, paginateListObjectsV2 } from "@aws-sdk/client-s3";
import { Input } from "@headlessui/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useEffect, useMemo, useState } from "react";

import credentials from "@/services/.credentials";
import Fuse from "fuse.js";

const fuseOptions = {
  includeScore: true,
  keys: ["Key"],
};

export default function SearchBar() {
  const [isFocused, setIsFocused] = useState(false);

  const s3Client = useS3Client();
  const [objects, setObjects] = useState<_Object[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (s3Client !== null) {
      setObjects([]);
      const paginator = paginateListObjectsV2(
        { client: s3Client, pageSize: 10 },
        { Bucket: credentials.BUCKET },
      );
      (async () => {
        for await (const page of paginator) {
          if (page.Contents !== undefined) {
            console.log(page.Contents);
            setObjects((oldObjects) =>
              oldObjects.concat(...(page.Contents as _Object[])),
            );
          }
        }
      })();
    }
  }, [s3Client]);

  const objectsQueried = useMemo(() => {
    const fuse = new Fuse(objects, fuseOptions);

    const objectsScored = fuse.search(query);
    //const objectsSorted = objectsScored.toSorted(object => object.score);
    return objectsScored.slice(0, 4).map((object) => object.item);
  }, [query, objects]);

  return (
    <form className="max-w-md mx-auto">
      <label
        htmlFor="default-search"
        className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
      >
        Search
      </label>
      <div
        className="relative focus:outline-none focus-visible:outline-none z-50 focus:ring-0"
        onFocus={() => setIsFocused(true)}
        onBlur={(e) => {
          setIsFocused(e.currentTarget.contains(e.relatedTarget));
        }}
      >
        <Input
          type="search"
          id="default-search"
          className="block w-full p-4 text-sm text-gray-900 border border-gray-300 ring-2 dark:ring-gray-900 transition-all rounded-lg bg-gray-50 outline-none focus:border-blue-500 dark:bg-gray-800 focus:dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-blue-500"
          placeholder="Search uploads..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          required
        />
        <button
          type="submit"
          className="text-white absolute top-2.5 end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg p-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 flex flex-row justify-center items-center"
        >
          <MagnifyingGlassIcon className="size-5" />
        </button>
        <div className="relative -z-10">
          <ul className="absolute w-full -top-4 pt-4 rounded-b-lg text-sm overflow-clip dark:bg-gray-800">
            {isFocused
              ? objectsQueried.map((object) => (
                  <li
                    key={object.Key}
                    className="border-b-[1px] border-b-gray-700 last:border-b-0"
                  >
                    <a
                      className="block px-4 py-3 underline-offset-2 hover:bg-gray-700 hover:underline"
                      href="/about"
                    >
                      {object.Key}
                    </a>
                  </li>
                ))
              : null}
          </ul>
        </div>
      </div>
    </form>
  );
}
