import React from "react";
import { Calculator, BarChart3, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
	const navigate = useNavigate();

	const sections = [
		{
			id: "quant",
			title: "Quantitative Aptitude",
			icon: Calculator,
			color: "bg-blue-600 hover:bg-blue-700",
		},
		{
			id: "lrdi",
			title: "Logical Reasoning & Data Interpretation",
			icon: BarChart3,
			color: "bg-purple-600 hover:bg-purple-700",
		},
		{
			id: "varc",
			title: "Verbal Ability & Reading Comprehension",
			icon: BookOpen,
			color: "bg-green-600 hover:bg-green-700",
		},
	];

	return (
		<div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
			<div className="max-w-4xl mx-auto px-6">
				<div className="text-center mb-12">
					<h1 className="text-4xl font-bold text-white mb-4">
						Question Formatter
					</h1>
					<p className="text-gray-400">
						Professional formatting tools for educational content
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{sections.map((section) => {
						const IconComponent = section.icon;
						return (
							<div
								key={section.id}
								onClick={() => navigate(`/${section.id}`)}
								className={`${section.color} cursor-pointer p-8 rounded-lg transition-all duration-200 transform hover:scale-105`}
							>
								<div className="text-center">
									<IconComponent className="w-12 h-12 mx-auto mb-4 text-white" />
									<h3 className="text-xl font-semibold text-white">
										{section.title}
									</h3>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};

export default HomePage;
