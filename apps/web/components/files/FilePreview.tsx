import {
  Box,
  Button,
  ButtonGroup,
  Center,
  Flex,
  Image,
  Link,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorMode,
} from "@chakra-ui/react";
import useKeys from "@hooks/useKeys";
import { MarkdownPreviewProps } from "@uiw/react-markdown-preview";
import "@uiw/react-markdown-preview/markdown.css";
import { TextareaCodeEditorProps } from "@uiw/react-textarea-code-editor";
import "@uiw/react-textarea-code-editor/dist.css";
import { download } from "@util/helpers";
import { DriveFile, Provider } from "@util/types";
import dynamic from "next/dynamic";
import "node_modules/video-react/dist/video-react.css";
import Papa from "papaparse";
import React, { useEffect, useMemo, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ExternalLink, FileDownload } from "tabler-icons-react";
import { Player } from "video-react";

const CodeEditor: React.ComponentType<TextareaCodeEditorProps> = dynamic(
  () => import("@uiw/react-textarea-code-editor").then((mod) => mod.default),
  { ssr: false },
);

const MarkdownPreview: React.ComponentType<MarkdownPreviewProps> = dynamic(
  () => import("@uiw/react-markdown-preview").then((mod) => mod.default),
  { ssr: false },
);

type Props = {
  url: string;
  file: DriveFile;
};

const FilePreview: React.FC<Props> = ({ url, file }) => {
  const [isError, setIsError] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [rawMd, setRawMd] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const extension = file.name.split(".").pop();
  const { colorMode } = useColorMode();

  const codeEditorStyles: React.CSSProperties = useMemo(
    () => ({
      height: "98%",
      color: colorMode === "light" ? "#2D3748" : "#FFFFFF",
      fontSize: 13,
      backgroundColor: colorMode === "light" ? "#FFFFFF" : "#2D3748",
      overflowY: "auto",
      fontFamily: "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
    }),
    [colorMode],
  );

  useEffect(() => {
    if (
      file?.contentType?.startsWith("text") ||
      file?.contentType === "application/json" ||
      file?.contentType === "text/markdown" ||
      extension === "md" ||
      showRaw
    ) {
      setLoading(true);
      fetch(url)
        .then((res) => res.text())
        .then((text) => setText(text))
        .catch(() => setIsError(true))
        .finally(() => setLoading(false));
    }
  }, [showRaw]);

  if (isError) {
    return <Error file={file} url={url} />;
  } else if (file?.contentType?.startsWith("image")) {
    return <Image src={url} alt={file.name} onError={() => setIsError(true)} />;
  } else if (file?.contentType?.startsWith("video")) {
    return (
      <Box
        children={<Player fluid={false} playsInline src={url} onError={() => setIsError(true)} />}
      />
    );
  } else if (file?.contentType?.startsWith("audio")) {
    return (
      <Flex p="6" align="center" justify="center">
        <audio controls onError={() => setIsError(true)}>
          <source src={url} type={file?.contentType} />
          Your browser does not support playing audio.
        </audio>
      </Flex>
    );
  } else if (file?.contentType === "application/pdf") {
    return (
      <iframe
        src={url}
        height={700}
        width="100%"
        title={file.name}
        style={{ minWidth: 500 }}
        onError={() => setIsError(true)}
      />
    );
  } else if (file?.contentType === "text/csv") {
    return (
      <ErrorBoundary FallbackComponent={(...props) => <Error url={url} file={file} {...props} />}>
        <CsvViewer file={file} url={url} />
      </ErrorBoundary>
    );
  } else if (/^docx?$|^xlsx?$|^pptx?$/.test(extension)) {
    return <GoogleDocsViewer file={file} url={url} />;
  } else if (file?.contentType === "text/markdown" || extension === "md") {
    return (
      <>
        {loading || !text ? (
          <Center m="20">
            <Spinner size="xl" />
          </Center>
        ) : (
          <Box height="600px">
            <Button variant="ghost" m="1" onClick={() => setRawMd(!rawMd)}>
              {!rawMd ? "View Raw" : "View Parsed"}
            </Button>
            {!rawMd ? (
              <MarkdownPreview
                source={text}
                disallowedElements={["script"]}
                style={{
                  height: "90%",
                  overflowY: "auto",
                  padding: 15,
                }}
              />
            ) : (
              <CodeEditor
                value={text}
                disabled
                language={extension}
                padding={15}
                style={codeEditorStyles}
              />
            )}
          </Box>
        )}
      </>
    );
  } else if (
    file?.contentType?.startsWith("text") ||
    file?.contentType === "application/json" ||
    showRaw
  ) {
    return (
      <>
        {loading || !text ? (
          <Center m="20">
            <Spinner size="xl" />
          </Center>
        ) : (
          <Box height="600px">
            <CodeEditor
              value={text}
              disabled
              language={extension}
              padding={15}
              style={{
                ...codeEditorStyles,
                marginTop: 40,
              }}
            />
          </Box>
        )}
      </>
    );
  }

  return <NoPreview file={file} setShowRaw={setShowRaw} />;
};

const Error = ({ file, url }) => {
  const { keys } = useKeys();
  return (
    <Flex flexDir="column" align="center" justify="center" p="6">
      <Text as="h1" fontSize="2xl" mb="4" align="center">
        Failed to preview the file
      </Text>
      {(Provider[keys.type] as Provider) === Provider.firebase && (
        <Text as="p" mb="2">
          Make sure you've{" "}
          <Link
            href="https://firefiles.app/docs/firebase/03-cors"
            target="_blank"
            textDecor="underline"
          >
            configured CORS correctly.
          </Link>
        </Text>
      )}
      <ButtonGroup>
        <Button leftIcon={<ExternalLink />} onClick={() => window.open(url, "_blank")}>
          Open in new tab
        </Button>
        <Button leftIcon={<FileDownload />} onClick={() => download(file)}>
          Download
        </Button>
      </ButtonGroup>
    </Flex>
  );
};

const NoPreview = ({ file, setShowRaw }) => {
  return (
    <Flex flexDir="column" align="center" justify="center" p="6">
      <Text as="h1" fontSize="2xl" mb="4" align="center">
        Preview not available
      </Text>
      <ButtonGroup>
        <Button onClick={() => setShowRaw(true)}>Show Raw</Button>
        <Button leftIcon={<FileDownload />} onClick={() => download(file)}>
          Download
        </Button>
      </ButtonGroup>
    </Flex>
  );
};

const GoogleDocsViewer = ({ file, url }) => {
  return (
    <Flex flexDir="column" align="center" justify="center" p="6">
      <Text as="h1" fontSize="2xl" align="center" fontWeight="semibold" mb="4">
        Couldn't preview the file
      </Text>
      <ButtonGroup>
        <Button
          onClick={() =>
            window.open(
              `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`,
              "_blank",
            )
          }
        >
          Open with Google Docs Viewer
        </Button>
        <Button leftIcon={<FileDownload />} onClick={() => download(file)}>
          Download
        </Button>
      </ButtonGroup>
    </Flex>
  );
};

const CsvViewer = ({ file, url }) => {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [rawFile, setRawFile] = useState<File>();

  useEffect(() => {
    if (!file || !url) return;
    try {
      urlToFile(url, file.name).then((file) => setRawFile(file));
    } catch (err) {
      throw err.message;
    }
  }, [file, url]);

  useEffect(() => {
    if (!rawFile) return;
    Papa.parse(rawFile, { header: true, dynamicTyping: true, complete: handleDataChange });
  }, [rawFile]);

  const makeColumns = (rawColumns) =>
    rawColumns.map((column) => ({ Header: column, accessor: column }));

  const handleDataChange = (file) => {
    file.data.pop();
    setData(file.data);
    setColumns(makeColumns(file.meta.fields));
  };

  return (
    <Box maxH="700px" overflowY="auto" overflowX="auto">
      {columns.length > 0 ? (
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              {columns.map((column) => (
                <Th key={column.Header}>{column.Header.replaceAll('"', "")}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {data.map((row, i) => (
              <Tr key={row.id}>
                {columns.map((column) => (
                  <Td key={column.accessor}>{row[column.accessor]}</Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      ) : (
        <Center m="20">
          <Spinner size="xl" />
        </Center>
      )}
    </Box>
  );
};

const urlToFile = async (url: string, name: string) => {
  try {
    const blob: any = await fetch(url).then((r) => r.blob());
    blob.lastModifiedDate = new Date();
    blob.name = name;
    return blob as File;
  } catch (err) {
    throw err.message;
  }
};

export default FilePreview;
