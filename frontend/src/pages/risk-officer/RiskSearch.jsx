import { useEffect, useState } from "react";
import RiskService from "../../service/RiskService";

export default function RiskSearch() {

    const [searchTitle, setSearchTitle] = useState("");
    const [risks, setRisks] = useState([]);

    useEffect(() => {
        fetchRisks();
    }, []);

    const fetchRisks = async () => {
        try {

            const response = await RiskService.getAllRisks();

            setRisks(response.data || []);

        } catch (error) {

            console.log(error);

        }
    };

    const handleSearch = async () => {

        try {

            if (searchTitle.trim() === "") {
                fetchRisks();
                return;
            }

            const response = await RiskService.searchRisks(searchTitle);

            setRisks(response.data || []);

        } catch (error) {

            console.log(error);

            alert("Search Failed");

        }

    };

    const handleReset = () => {

        setSearchTitle("");

        fetchRisks();

    };

    return (

        <div className="p-6">

            <h1 className="text-2xl font-bold mb-6">
                Search Risks
            </h1>

            <div className="flex gap-3 mb-6">

                <input
                    type="text"
                    placeholder="Enter Risk Title"
                    value={searchTitle}
                    onChange={(e) => setSearchTitle(e.target.value)}
                    className="border rounded p-2 w-96"
                />

                <button
                    onClick={handleSearch}
                    className="bg-blue-600 text-white px-5 rounded"
                >
                    Search
                </button>

                <button
                    onClick={handleReset}
                    className="bg-gray-600 text-white px-5 rounded"
                >
                    Reset
                </button>

            </div>

            <div className="bg-white rounded shadow">

                <table className="w-full">

                    <thead className="bg-gray-200">

                        <tr>

                            <th className="p-3">Risk ID</th>
                            <th>Title</th>
                            <th>Department</th>
                            <th>Level</th>
                            <th>Status</th>
                            <th>Score</th>

                        </tr>

                    </thead>

                    <tbody>

                        {

                            risks.length > 0 ?

                                risks.map((risk) => (

                                    <tr
                                        key={risk.id}
                                        className="border-b text-center"
                                    >

                                        <td className="p-3">
                                            {risk.riskId}
                                        </td>

                                        <td>
                                            {risk.title}
                                        </td>

                                        <td>
                                            {risk.department}
                                        </td>

                                        <td>
                                            {risk.level}
                                        </td>

                                        <td>
                                            {risk.status}
                                        </td>

                                        <td>
                                            {risk.riskScore}
                                        </td>

                                    </tr>

                                ))

                                :

                                <tr>

                                    <td
                                        colSpan="6"
                                        className="text-center p-5"
                                    >
                                        No Risks Found
                                    </td>

                                </tr>

                        }

                    </tbody>

                </table>

            </div>

        </div>

    );

}