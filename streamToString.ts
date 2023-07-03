export async function streamToString(stream: ReadableStream<Uint8Array>): Promise<string> {
  const decoder = new TextDecoder("utf-8");
  let result = '';
  const reader = stream.getReader();
  let chunk;

  while (!(chunk = await reader.read()).done) {
    result += decoder.decode(chunk.value || new Uint8Array, { stream: true });
  }

  result += decoder.decode(); // finish the stream

  return result;
}
