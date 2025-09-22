import React, { useState, useEffect } from "react";
// import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { X, Clock, Plus } from "lucide-react";
import { useCurrentUser } from "@/hooks/auth";
import Loader from "../shared/Loader";
import { Input } from "../ui/input";

interface UserData {
  id: string;
  name: string;
  email: string;
  emailVerified: string;
  emailVerifToken: null;
  mobile: string;
  role: string;
  vendorProfileId: null;
  profilePic: null;
  coverPic: null;
  secureProfilePic: null;
  createdBy: null;
  createdAt: string;
  updatedAt: string;
  vendorProfile: null;
}

interface ContactInfoData {
  primaryContactName?: string;
  primaryContactPhone?: string;
  whatsappNumber?: string;
  primaryContactEmail?: string;
  anotherMobileNumbers: string[];
  anotheremails: string[];
  businessOpeningDays?: string[];
  businessTiming?: {
    start: string;
    end: string;
  };
}

interface ContactInfoProps {
  data: ContactInfoData;
  updateData: (data: Partial<ContactInfoData>) => void;
  handleNextStep: () => void;
}

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const ContactInfo2: React.FC<ContactInfoProps> = ({ data, updateData , handleNextStep }) => {
  const [newPhone, setNewPhone] = useState<string>("");
  const [newEmail, setNewEmail] = useState<string>("");
  const [sameAsPhone, setSameAsPhone] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const user = useCurrentUser();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/users?id=${user?.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        const userData: UserData[] = await response.json();

        if (userData && userData.length > 0) {
          const user = userData[0];
          updateData({
            primaryContactName: user.name,
            primaryContactPhone: user.mobile,
            primaryContactEmail: user.email,
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleAddPhone = () => {
    if (newPhone) {
      if (!data.primaryContactPhone) {
        updateData({
          primaryContactPhone: newPhone,
          whatsappNumber: sameAsPhone ? newPhone : data.whatsappNumber,
        });
      } else {
        const updatedNumbers = [...(data.anotherMobileNumbers || []), newPhone];
        updateData({ anotherMobileNumbers: updatedNumbers });
      }
      setNewPhone("");
    }
  };

  const handleAddEmail = () => {
    if (newEmail) {
      if (!data.primaryContactEmail) {
        updateData({ primaryContactEmail: newEmail });
      } else {
        const updatedEmails = [...(data.anotheremails || []), newEmail];
        updateData({ anotheremails: updatedEmails });
      }
      setNewEmail("");
    }
  };

  const handleRemovePhone = (index: number) => {
    const updatedNumbers = [...(data.anotherMobileNumbers || [])];
    updatedNumbers.splice(index, 1);
    updateData({ anotherMobileNumbers: updatedNumbers });
  };

  const handleRemoveEmail = (index: number) => {
    const updatedEmails = [...(data.anotheremails || [])];
    updatedEmails.splice(index, 1);
    updateData({ anotheremails: updatedEmails });
  };

  const handleKeyPress = (e: React.KeyboardEvent, type: "phone" | "email") => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (type === "phone") {
        handleAddPhone();
      } else {
        handleAddEmail();
      }
    }
  };

  const toggleDaySelection = (day: string) => {
    const currentDays = data.businessOpeningDays || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day];

    updateData({ businessOpeningDays: newDays });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-x-12 flex flex-col md:flex-row gap-8 ">
      <div className="max-w-4xl mx-auto p-6 space-y-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-8">Add Business Timings</h2>

        {/* Business Opening Days - Redesigned */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-1 bg-primary w-28 rounded"></div>
            <div className="h-1 bg-primary w-28 rounded"></div>
            <div className="h-1 bg-primary w-28 rounded"></div>
          </div>

          <div className="flex flex-wrap gap-2 my-4">
            {daysOfWeek.map((day) => (
              <button
                key={day}
                className={`px-4 py-2 rounded-full transition-all ${
                  data.businessOpeningDays?.includes(day)
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
                onClick={() => toggleDaySelection(day)}
              >
                {day}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 my-2">
            <Checkbox
              id="clearAll"
              checked={data.businessOpeningDays?.length === 7}
              onCheckedChange={(checked) => {
                if (checked) {
                  updateData({ businessOpeningDays: daysOfWeek });
                } else {
                  updateData({ businessOpeningDays: [] });
                }
              }}
            />
            <label htmlFor="clearAll" className="text-sm text-gray-600">
              Open All Days
            </label>
          </div>
        </div>

        {/* Business Timing - Redesigned */}
        <div className="space-y-3 mt-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-600 font-medium">
                Opens At
              </label>
              <div className="relative">
                <Input
                  type="time"
                  value={data.businessTiming?.start || "09:00"}
                  onChange={(e) =>
                    updateData({
                      businessTiming: {
                        start: e.target.value,
                        end: data.businessTiming?.end || "17:00",
                      },
                    })
                  }
                  className="w-full pr-10"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Clock className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-600 font-medium">
                Closes At
              </label>
              <div className="relative">
                <Input
                  type="time"
                  value={data.businessTiming?.end || "17:00"}
                  onChange={(e) =>
                    updateData({
                      businessTiming: {
                        start: data.businessTiming?.start || "09:00",
                        end: e.target.value,
                      },
                    })
                  }
                  className="w-full pr-10"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Clock className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          <button className="text-primary text-sm flex items-center mt-2">
            <Plus className="h-4 w-4 mr-1" />
            Add Another Time Slot
          </button>
        </div>

        {/* Finish Button */}
        <button onClick={handleNextStep} className="w-full bg-primary text-white py-3 rounded-md mt-8 hover:bg-[#d58829ee] transition-colors">
          Finish
        </button>
      </div>
      {/* Right Side - Mobile Preview */}
      <div className="w-full md:w-1/2 flex justify-center space-x-4 items-start">
        <div className="relative bg-gray-900 rounded-3xl p-3 shadow-xl max-w-xs">
          <div className="relative bg-white rounded-2xl overflow-hidden h-[500px] w-64">
            {/* Preview Content */}
            <div>
              {/* Cover Image */}
              <img
                src="/pic1.png"
                alt="Business Cover"
                className="w-full h-24 object-cover"
              />

              <div className="p-4 relative">
                {/* Business Card */}
                <div className="bg-white rounded-lg shadow-md p-3 mb-4 -mt-6 relative z-10">
                  <div className="flex items-center">
                    <div className="w-14 h-14 mr-3 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                      <span className="text-lg font-bold text-gray-400">
                        CW
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">Cafe Wink</h3>
                      <p className="text-xs text-gray-500">
                        Restaurant and Coffee
                      </p>
                      <p className="text-xs text-gray-500">
                        {data.primaryContactName
                          ? `Contact: ${data.primaryContactName}`
                          : ""}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Reviews Section */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold mb-2">Reviews</h4>
                  <div className="flex items-center">
                    <div className="flex text-amber-500">
                      {"★★★★★".split("").map((star, i) => (
                        <span key={i}>{star}</span>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 ml-2">
                      (101 Reviews)
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Open until 9:00 PM today - 9:30 AM to 9:00 PM
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mb-4">
                  <button className="bg-amber-500 text-white text-xs rounded-full px-4 py-1">
                    Message
                  </button>
                  <button className="bg-amber-500 text-white text-xs rounded-full px-4 py-1">
                    Call
                  </button>
                </div>

                {/* Items */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Items</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-100 rounded-lg h-16 flex items-center justify-center overflow-hidden">
                      <img
                        src="/pic3.png"
                        alt="Coffee"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="bg-gray-100 rounded-lg h-16 flex items-center justify-center overflow-hidden">
                      <img
                        src="/pic2.png"
                        alt="Pastry"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo2;
