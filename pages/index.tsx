import clsx from 'clsx';
import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import React from 'react';
import {
  ReactSketchCanvas,
  ExportImageType,
  ReactSketchCanvasProps,
  ReactSketchCanvasRef,
} from 'react-sketch-canvas';

interface InputFieldProps {
  fieldName: keyof ReactSketchCanvasProps;
  type?: string;
  canvasProps: Partial<ReactSketchCanvasProps>;
  setCanvasProps: React.Dispatch<
    React.SetStateAction<Partial<ReactSketchCanvasProps>>
  >;
  label: string;
}

function InputField({
  fieldName,
  type = 'text',
  canvasProps,
  setCanvasProps,
  label,
}: InputFieldProps) {
  const handleChange = ({
    target,
  }: React.ChangeEvent<HTMLInputElement>): void => {
    setCanvasProps((prevCanvasProps: Partial<ReactSketchCanvasProps>) => ({
      ...prevCanvasProps,
      [fieldName]: target.value,
    }));
  };

  const id = 'validation' + fieldName;

  return (
    <div className="border self-center mb-4">
      <label className="pr-2 ">{label}</label>
      <input
        name={fieldName}
        type={type}
        id={id}
        value={canvasProps[fieldName] as string}
        onChange={handleChange}
        min={1}
        max={30}
      />
    </div>
  );
}

type Handlers = [string, () => void, string][];

const Home: NextPage = () => {
  const canvasRef = React.createRef<ReactSketchCanvasRef>();
  const [paths, setPaths] = React.useState<CanvasPath[]>([]);
  const [lastStroke, setLastStroke] = React.useState<{
    stroke: CanvasPath | null;
    isEraser: boolean | null;
  }>({ stroke: null, isEraser: null });

  const [canvasProps, setCanvasProps] = React.useState<
    Partial<ReactSketchCanvasProps>
  >({
    width: '100%',
    height: '500px',
    strokeWidth: 4,
    eraserWidth: 5,
    strokeColor: '#000000',
    canvasColor: '#FFFFFF',
    style: { height: '500px', width: '560px', margin: '0.5rem 0 0 0' },
    svgStyle: {
      height: '500px',
      width: '560px',
      border: '0.0625rem solid #9c9c9c',
      borderRadius: '0.25rem',
    },
    exportWithBackgroundImage: true,
    withTimestamp: true,
    allowOnlyPointerType: 'all',
  });

  const createButton = (
    label: string,
    handler: () => void,
    themeColor: string
  ) => (
    <button
      key={label}
      className={clsx(
        themeColor === 'undo'
          ? 'bg-red-400'
          : themeColor === 'eraser'
          ? 'bg-red-200'
          : themeColor === 'export'
          ? 'bg-green-500'
          : '',
        'border px-10 rounded-md'
      )}
      type="button"
      onClick={handler}
    >
      {label}
    </button>
  );
  const [dataURI, setDataURI] = React.useState<string>('');
  const [exportImageType, setexportImageType] =
    React.useState<ExportImageType>('png');

  function debugBase64(base64URL: string) {
    var win = window.open();
    (win as any).document.write(
      '<iframe src="' +
        base64URL +
        '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>'
    );
  }

  const imageExportHandler = async () => {
    const exportImage = canvasRef.current?.exportImage;

    if (exportImage) {
      const exportedDataURI = await exportImage(exportImageType);
      setDataURI(exportedDataURI);
      return exportedDataURI;
    }
  };

  const undoHandler = () => {
    const undo = canvasRef.current?.undo;

    if (undo) {
      undo();
    }
  };

  const penHandler = () => {
    const eraseMode = canvasRef.current?.eraseMode;

    if (eraseMode) {
      eraseMode(false);
    }
  };

  const eraserHandler = () => {
    const eraseMode = canvasRef.current?.eraseMode;

    if (eraseMode) {
      eraseMode(true);
    }
  };

  const inputProps: Array<
    [keyof ReactSketchCanvasProps, 'text' | 'number', any]
  > = [
    ['strokeWidth', 'number', 'Pen Width'],
    ['eraserWidth', 'number', 'Eraser Width'],
  ];

  const buttonsWithHandlers: Handlers = [
    ['Undo', undoHandler, 'undo'],
    // ['Redo', redoHandler, 'primary'],
    // ['Clear All', clearHandler, 'primary'],
    // ['Reset All', resetCanvasHandler, 'primary'],
    ['Pen', penHandler, 'pen'],
    ['Eraser', eraserHandler, 'eraser'],
    ['Export Image', imageExportHandler, 'export'],
    // ['Export SVG', svgExportHandler, 'success'],
    // ['Get Sketching time', getSketchingTimeHandler, 'success'],
  ];

  const onChange = (updatedPaths: CanvasPath[]): void => {
    setPaths(updatedPaths);
  };

  return (
    <div>
      <Head>
        <title>Create Your Own Chad</title>
        <meta name="description" content="Create Your Own Chad" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col justify-center items-center pt-2 px-[2rem] pb-1">
        <h1 className="text-6xl">Create Your Own Chad</h1>

        <form className="pt-4 flex flex-wrap space-x-10 justify-center">
          {inputProps.map(([fieldName, type, title]) => (
            <InputField
              key={fieldName}
              fieldName={fieldName}
              label={title}
              type={type}
              canvasProps={canvasProps}
              setCanvasProps={setCanvasProps}
            />
          ))}
          <div className="space-x-5">
            {buttonsWithHandlers.map(([label, handler, themeColor]) =>
              createButton(label, handler, themeColor)
            )}
          </div>
        </form>
        {dataURI && (
          <a
            href={dataURI}
            download="chad.jpeg"
            className="border px-5 rounded-md bg-green-500"
            onClick={() => {
              setDataURI('');
            }}
          >
            Download
          </a>
        )}
        <div className="flex items-center pt-2">
          <label className="pr-2">Pen Color</label>
          <input
            type="color"
            name="strokeColor"
            className="form-control form-control-color"
            id="strokeColorInput"
            value={canvasProps.strokeColor}
            title="Choose stroke color"
            onChange={(e) => {
              setCanvasProps(
                (prevCanvasProps: Partial<ReactSketchCanvasProps>) => ({
                  ...prevCanvasProps,
                  strokeColor: e.target.value,
                })
              );
            }}
          ></input>
        </div>
        <ReactSketchCanvas
          ref={canvasRef}
          onChange={() => onChange}
          strokeColor={canvasProps.strokeColor}
          onStroke={(stroke, isEraser) => setLastStroke({ stroke, isEraser })}
          {...canvasProps}
          backgroundImage="/chad_template.jpeg"
        />
      </main>

      <footer className="flex justify-center border-t fixed bottom-0 mb-0 w-screen">
        <a
          href="https://github.com/pedrobrun"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center"
        >
          Code{' '}
          <span className="pl-2 pt-2">
            <Image
              src="/github-icon.png"
              alt="Vercel Logo"
              height={30}
              width={30}
            />
          </span>
        </a>
      </footer>
    </div>
  );
};

export default Home;
