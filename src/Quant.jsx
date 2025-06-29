import React, { useState } from "react";
import { Calculator, BookOpen, ToggleLeft, ToggleRight } from "lucide-react";
import QuantMCQFormaterOne from "./QuantMCQFormaterOne";
import QuantTITAFormater from "./QuantTITAFormater";

const Quant = () => {
	const [activeMode, setActiveMode] = useState("mcq"); // 'mcq' or 'tita'

	const toggleMode = () => {
		setActiveMode(activeMode === "mcq" ? "tita" : "mcq");
	};

	return (
		<div className="min-h-screen bg-gray-900 text-gray-100">
			{/* Header with Toggle */}
			<div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
				<div className="max-w-6xl mx-auto px-6 py-4">
					<div className="flex items-center justify-between">
						{/* Logo/Title */}
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
								<Calculator className="w-6 h-6 text-white" />
							</div>
							<div>
								<h1 className="text-xl font-bold text-white">
									Quant Formatter
								</h1>
								<p className="text-sm text-gray-400">
									Professional Question Formatting Tool
								</p>
							</div>
						</div>

						{/* Mode Toggle */}
						<div className="flex items-center gap-4">
							<div className="text-sm text-gray-300 font-medium">
								{activeMode === "mcq" ? "MCQ Mode" : "TITA Mode"}
							</div>

							{/* Toggle Switch */}
							<div className="relative">
								<button
									onClick={toggleMode}
									className={`relative inline-flex items-center h-8 w-16 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 ${
										activeMode === "mcq"
											? "bg-blue-600 focus:ring-blue-500"
											: "bg-green-600 focus:ring-green-500"
									}`}
								>
									<span
										className={`inline-block w-6 h-6 transform bg-white rounded-full transition-transform duration-300 ${
											activeMode === "mcq" ? "translate-x-1" : "translate-x-9"
										}`}
									/>
								</button>
							</div>

							{/* Mode Labels */}
							<div className="flex items-center gap-3 text-sm">
								<div
									className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
										activeMode === "mcq"
											? "bg-blue-600/20 text-blue-300 border border-blue-500/30"
											: "bg-gray-700 text-gray-400 border border-gray-600"
									}`}
								>
									<BookOpen className="w-4 h-4" />
									<span className="font-medium">MCQ</span>
								</div>

								<div
									className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
										activeMode === "tita"
											? "bg-green-600/20 text-green-300 border border-green-500/30"
											: "bg-gray-700 text-gray-400 border border-gray-600"
									}`}
								>
									<Calculator className="w-4 h-4" />
									<span className="font-medium">TITA</span>
								</div>
							</div>
						</div>
					</div>

					{/* Mode Description */}
					<div className="mt-4 p-3 bg-gray-700/50 rounded-lg border border-gray-600">
						<div className="flex items-center gap-2">
							{activeMode === "mcq" ? (
								<>
									<BookOpen className="w-5 h-5 text-blue-400" />
									<span className="font-medium text-blue-400">
										Multiple Choice Questions (MCQ)
									</span>
								</>
							) : (
								<>
									<Calculator className="w-5 h-5 text-green-400" />
									<span className="font-medium text-green-400">
										Type In The Answer (TITA)
									</span>
								</>
							)}
						</div>
						<p className="text-sm text-gray-400 mt-1">
							{activeMode === "mcq"
								? "Process questions with (A), (B), (C), (D) options. TITA questions will be automatically filtered out."
								: "Extract and format fill-in-the-blank questions with numerical or text answers."}
						</p>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="transition-all duration-500 ease-in-out">
				{activeMode === "mcq" ? (
					<div key="mcq" className="animate-fade-in">
						<QuantMCQFormaterOne />
					</div>
				) : (
					<div key="tita" className="animate-fade-in">
						<QuantTITAFormater />
					</div>
				)}
			</div>

			{/* Custom CSS for animations */}
			<style jsx>{`
				.animate-fade-in {
					animation: fadeIn 0.5s ease-in-out;
				}

				@keyframes fadeIn {
					from {
						opacity: 0;
						transform: translateY(10px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}
			`}</style>
		</div>
	);
};

export default Quant;
