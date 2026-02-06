export type AnalyzeImagesInput = {
  apiKey: string;
  prompt: string;
  imagePaths: string[];
};

export type AnalyzeImagesResult = {
  provider: string;
  analysis: string;
  raw: unknown;
};

export type AnalyzeImagesFn = (
  input: AnalyzeImagesInput,
) => Promise<AnalyzeImagesResult>;
