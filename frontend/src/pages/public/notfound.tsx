import React from "react";

const NotFound: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="relative w-full max-w-[900px] flex flex-col items-center">
        {/* Background 404 */}
        <div className="absolute flex z-[-1] items-center justify-center text-gray-500 opacity-20">
          <div className="text-[20rem] font-bold">4</div>
          <div className="text-[20rem] font-bold">0</div>
          <div className="text-[20rem] font-bold">4</div>
        </div>

        {/* TV and Antenna */}
        <div className="relative flex flex-col items-center">
          {/* Antenna */}
          <div className="relative">
            {/* Antenna sticks */}
            <div className="absolute w-[2px] h-[100px] bg-black rotate-[-20deg] -left-[10px] -top-[100px]"></div>
            <div className="absolute w-[2px] h-[100px] bg-black rotate-[20deg] -right-[10px] -top-[100px]"></div>

            {/* Antenna dots */}
            <div className="absolute w-[8px] h-[8px] rounded-full bg-black -top-[100px] left-[10px]"></div>
            <div className="absolute w-[8px] h-[8px] rounded-full bg-black -top-[100px] right-[10px]"></div>

            {/* Antenna ball */}
            <div className="absolute w-[60px] h-[60px] rounded-full bg-orange-500 left-1/2 -ml-[30px] -top-[20px]">
              {/* Light reflection */}
              <div className="absolute w-[20px] h-[10px] bg-white opacity-60 rounded-full top-[10px] left-[10px]"></div>
            </div>
          </div>

          {/* TV Body */}
          <div className="relative w-[450px] h-[200px] bg-orange-400 border-8 border-[#CA6E00] rounded-[18px] flex items-center justify-between p-4 overflow-hidden">
            {/* Screen */}
            <div className="w-[320px] h-[160px] border-8 border-[#CA6E00] rounded-[10px] bg-black flex items-center justify-center relative overflow-hidden">
              {/* Static noise pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(white_1px,transparent_0)] bg-black bg-[size:4px_4px] opacity-70"></div>
              <div className="bg-black px-6 py-2 z-10 rounded text-white font-bold tracking-wider border-2 border-white">
                NOT FOUND
              </div>
            </div>

            {/* TV Controls */}
            <div className="w-[90px] h-[160px] border-l-4 border-[#CA6E00] pl-4 flex flex-col justify-between">
              {/* Knobs */}
              <div className="flex flex-col gap-6">
                <div className="w-12 h-12 rounded-full border-4 border-[#CA6E00] bg-[#333] relative">
                  <div className="absolute w-8 h-2 bg-[#222] top-[14px] left-[4px] rounded-full rotate-[30deg]"></div>
                </div>
                <div className="w-12 h-12 rounded-full border-4 border-[#CA6E00] bg-[#333] relative">
                  <div className="absolute w-8 h-2 bg-[#222] top-[14px] left-[4px] rounded-full rotate-[30deg]"></div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-2 mt-2">
                <div className="flex gap-2 justify-center">
                  <div className="w-3 h-3 rounded-full bg-black"></div>
                  <div className="w-3 h-3 rounded-full bg-black"></div>
                  <div className="w-3 h-3 rounded-full bg-black"></div>
                </div>
                <div className="w-full h-[2px] bg-black"></div>
                <div className="w-full h-[2px] bg-black"></div>
                <div className="w-full h-[2px] bg-black"></div>
              </div>
            </div>
          </div>

          {/* TV Stand */}
          <div className="relative w-full flex justify-center">
            <div className="w-[300px] h-[5px] bg-black mt-2"></div>
            <div className="absolute w-[60px] h-[25px] bg-[#555] left-[150px] -bottom-[20px]"></div>
            <div className="absolute w-[60px] h-[25px] bg-[#555] right-[150px] -bottom-[20px]"></div>
            <div className="absolute w-[400px] h-[2px] bg-black -bottom-[25px]"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
