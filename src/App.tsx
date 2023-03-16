import { useRef, useState } from "react";
import { SSE } from "sse";

const apiUrl = "https://api.openai.com/v1/completions";

function App() {
  const [reply, setReply] = useState<string>("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const replyRef = useRef<HTMLDivElement>(null);
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  const onPrompt = async () => {
    if (replyRef.current?.innerHTML) replyRef.current.innerHTML = "";

    const options = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      payload: JSON.stringify({
        model: "text-davinci-003",
        prompt: `${inputRef.current?.value}`,
        max_tokens: 1024,
        stream: true,
      }),
    };

    let source = new SSE(apiUrl, options);

    source.onmessage = (event: any) => {
      if (event.data !== "[DONE]") {
        let payload = JSON.parse(event.data);
        let text = payload.choices[0].text;
        if (text !== "\n") {
          console.log("Text: " + text);
          replyRef.current?.append(text);
        }
      } else {
        source.close();
      }
    };

    source.stream();
  };

  const clear = () => {
    if (inputRef.current?.value) inputRef.current.value = "";
    if (replyRef.current?.innerHTML) replyRef.current.innerHTML = "";
  }

  return (
    <div className="min-w-screen min-h-screen h-full flex flex-col justify-center items-center bg-gradient-to-r from-cyan-900 to-blue-900 text-white">
    <div className="w-[90%] max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold">OpenAI GPT-3</h1>
          <p className="text-gray-300">Powered by OpenAI</p>
          <p className="text-gray-200"> GPT-3 is a natural language processing model that uses deep learning to produce human-like text. It is the third-generation language model from OpenAI, following GPT and GPT-2. GPT-3 is the largest language model ever released, with 175 billion parameters and 17 trillion connections. It was trained on a dataset of 45 GB of internet text.</p>
        </div>
        <form
          onClick={(e) => {
            e.preventDefault();
          }}
          className="flex flex-col gap-2"
        >
          <textarea
            ref={inputRef}
            className="outline-none bg-gray-50/10 p-4 my-2 rounded-md"
            cols={10}
            rows={10}
            placeholder="Enter your prompt here..."
          />
          <div className="w-full flex gap-2">
            <button
              className="w-full px-4 py-2 bg-indigo-500 text-white hover:bg-indigo-600 outline-none rounded-md"
              onClick={onPrompt}
            >
              Prompt
            </button>
            <button 
              className="w-full px-4 py-2 bg-gray-500 text-white hover:bg-gray-600 rounded-md"
              onClick={clear}> Clear </button>
          </div>
        </form>

        <div className="min-h-[64px] h-full" ref={replyRef}></div>
        <p className="text-xs text-gray-50"> Powered by OpenAI </p>
      </div>
    </div>
  );
}

export default App;
