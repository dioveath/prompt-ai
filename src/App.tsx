import { useRef, useState } from "react";
import { SSE } from "sse";

const apiUrl = "https://api.openai.com/v1/completions";

function App() {
  const [reply, setReply] = useState<string>("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const replyRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const onPrompt = async () => {
    if (replyRef.current?.innerHTML) replyRef.current.innerHTML = "";
    setLoading(true);

    try {
      const options = {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiRef.current?.value}`,
        },
        payload: JSON.stringify({
          model: "text-davinci-003",
          prompt: `${inputRef.current?.value}`,
          max_tokens: 1024,
          stream: true,
        }),
      };

      let source = new SSE(apiUrl, options);

      source.onerror = (error: any) => {
        console.log("error");
        const data = JSON.parse(error.data);
        setError(data.error.message);
      };
      
      source.onmessage = (event: any) => {
        if (event.data !== "[DONE]") {
          let payload = JSON.parse(event.data);
          let text = payload.choices[0].text;
          if (text !== "\n") {
            // console.log("Text: " + text);
            replyRef.current?.append(text);
          }
        } else {
          source.close();
        }
      };

      source.stream();
    } catch (error: any) {
      console.log("some error");
      console.log(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    if (inputRef.current?.value) inputRef.current.value = "";
    if (replyRef.current?.innerHTML) replyRef.current.innerHTML = "";
    setError("");
  };

  return (
    <div className="min-w-screen min-h-screen h-full flex flex-col justify-center items-center bg-gradient-to-r from-cyan-900 to-blue-900 text-white">
      <div className="w-[90%] max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold">OpenAI GPT-3</h1>
          <p className="text-gray-300">Powered by OpenAI</p>
          <p className="text-gray-200">
            GPT-3 is a natural language processing model that uses deep learning
            to produce human-like text. It is the third-generation language
            model from OpenAI, following GPT and GPT-2. GPT-3 is the largest
            language model ever released, with 175 billion parameters and 17
            trillion connections. It was trained on a dataset of 45 GB of
            internet text.
          </p>
        </div>
        <form
          onClick={(e) => {
            e.preventDefault();
          }}
          className="flex flex-col gap-2"
        >
          <input
            type="text"
            placeholder="API KEY"
            className="px-4 py-2 mt-2 outline-none rounded-md bg-gray-50/10"
            ref={apiRef}
            onChange={(e) =>  { setError('') } }
          />
          <textarea
            ref={inputRef}
            className="outline-none bg-gray-50/10 p-4 my-2 rounded-md"
            cols={10}
            rows={10}
            placeholder="Enter your prompt here..."
            onChange={(e) =>  { setError('') } }
          />
          <div className="w-full flex gap-2">
            <button
              className="w-full px-4 py-2 bg-indigo-500 text-white hover:bg-indigo-600 outline-none rounded-md disabled:bg-gray-900"
              onClick={onPrompt}
              disabled={loading}
            >
              Prompt
            </button>
            <button
              className="w-full px-4 py-2 bg-gray-500 text-white hover:bg-gray-600 rounded-md disabled:bg-gray-900"
              onClick={clear}
              disabled={loading}
            >
              Clear
            </button>
          </div>
        </form>

        {error && ( <p className="text-xs text-red-500 py-2"> {error} </p> )}
        { loading && ( 
          <div className="w-full h-full flex justify-center items-center min-h-[64px]">
            <p className="text-xs text-gray-50 py-2"> Loading... </p>
          </div>
         )}
        { !loading && (<div className="min-h-[64px] h-full my-4" ref={replyRef}></div>)}
        <p className="text-xs text-gray-50"> Powered by OpenAI </p>
      </div>
    </div>
  );
}

export default App;
