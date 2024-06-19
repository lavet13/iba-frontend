import { GraphQLClient, RequestMiddleware } from "graphql-request";
import { set, isArray } from "lodash-es";
import { once } from "events";

// const toBlob = async (data: any) => {
//   if ("pipe" in data) {
//     const stream = data as NodeJS.ReadableStream;
//     if (!stream) throw new Error("");
//
//     const chunks: any[] = [];
//     const handler = (data: any) => {
//       chunks.push(data);
//     };
//     stream.on("data", handler);
//     await once(stream, "end");
//     stream.removeListener("data", handler);
//
//     return new Blob(chunks);
//   }
//
//   return new Blob([data]);
// };

const isExtractableFile = <ValueType>(value: ValueType) => {
  return (
    (typeof File !== "undefined" && value instanceof File) ||
    (typeof Blob !== "undefined" && value instanceof Blob) ||
    (typeof Buffer !== "undefined" && value instanceof Buffer) ||
    (typeof value === `object` && value !== null && `pipe` in value && typeof value.pipe === `function`)
  );
};

//@ts-ignore
const isPlainObject = <T>(value: T): value is Object => value && [undefined, Object].includes(value.constructor);
const recursiveExtractFiles = (variableKey: string, variableValue: any, prefix: string): any => {
  if (isExtractableFile(variableValue)) {
    return [
      {
        variableKey: [`${prefix}.${variableKey}`],
        file: variableValue,
      },
    ];
  }

  if (isArray(variableValue) && variableValue.every((item) => isExtractableFile(item))) {
    return variableValue.map((file, fileIndex) => {
      return {
        variableKey: [`${prefix}.${variableKey}.${fileIndex}`],
        file,
      };
    });
  }

  if (isPlainObject(variableValue)) {
    const ggg = Object.entries(variableValue)
      .map(([key, value]: any) => recursiveExtractFiles(key, value, `${prefix}.${variableKey}`))
      .flat();

    return ggg;
  }

  return [];
};

export const requestMiddlewareUploadFiles: RequestMiddleware = async (request) => {
  const files = Object.entries(request.variables || {}).flatMap(([variableKey, variableValue]) => {
    return recursiveExtractFiles(variableKey, variableValue, "variables");
  });

  if (!files.length) {
    return request;
  }

  const form = new FormData();
  const parsedBody = JSON.parse(request.body as string);
  for (const file of files) {
    //remove file here to reduce request size
    set(parsedBody, file.variableKey[0], null);
  }
  form.append("operations", JSON.stringify(parsedBody));

  const map = files.reduce((accumulator, { variableKey }, index) => {
    return {
      ...accumulator,
      [index.toString()]: variableKey,
    };
  }, {});

  form.append("map", JSON.stringify(map));

  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    // form.append(index.toString(), await toBlob(file.file));
    form.append(index.toString(), file.file);
  }

  const { "Content-Type": _, ...newHeaders } = request.headers as Record<string, string>;

  return {
    ...request,
    body: form,
    headers: newHeaders,
  };
};

const client = new GraphQLClient(import.meta.env.VITE_GRAPHQL_URI, {
  requestMiddleware: requestMiddlewareUploadFiles,
  mode: 'cors',
  credentials: 'include',
});

export default client;
