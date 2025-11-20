// File: src/components/DiseaseDetection.tsx
import React, { useState } from 'react';
import { Upload, Image, Spin, Alert, Button, message } from 'antd';
import { UploadOutlined, ReloadOutlined } from '@ant-design/icons';

interface DetectionResult {
  disease: string;
  confidence: number;
  description: string;
  treatment: string;
}

// Mock data for demonstration
const MOCK_RESPONSES = [
  {
    disease: 'Tomato Early Blight',
    confidence: 0.87,
    description: 'Early blight is a common tomato disease caused by the fungus Alternaria solani. It appears as concentric brown spots on leaves, often with a yellow halo.',
    treatment: 'Remove affected leaves, apply copper-based fungicides, and ensure proper plant spacing for air circulation.'
  },
  {
    disease: 'Tomato Late Blight',
    confidence: 0.92,
    description: 'Late blight is a serious disease caused by the oomycete Phytophthora infestans. It causes large, dark brown lesions on leaves and fruits.',
    treatment: 'Apply fungicides containing chlorothalonil or mancozeb, remove and destroy infected plants, and avoid overhead watering.'
  },
  {
    disease: 'Healthy Plant',
    confidence: 0.95,
    description: 'Your plant appears to be healthy with no signs of common diseases. The leaves are green and show no visible symptoms of stress or infection.',
    treatment: 'Continue with regular care including proper watering, adequate sunlight, and balanced fertilization.'
  }
];

const DiseaseDetection: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
      return Upload.LIST_IGNORE;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Image must be smaller than 5MB!');
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const handleChange = (info: any) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageUrl(e.target?.result as string);
        // Simulate API call with random response
        setTimeout(() => {
          const randomResponse = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
          setResult(randomResponse);
          setLoading(false);
        }, 1500);
      };
      reader.readAsDataURL(info.file.originFileObj);
    }
  };

  const handleRetry = () => {
    setImageUrl(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">AI-Powered Plant Disease Detection</h2>
      
      {!imageUrl ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition-colors">
          <Upload
            name="plantImage"
            listType="picture-card"
            className="uploader"
            showUploadList={false}
            beforeUpload={beforeUpload}
            onChange={handleChange}
            accept="image/*"
            customRequest={({ onSuccess }) => {
              if (onSuccess) {
                onSuccess('ok');
              }
            }}
          >
            <div className="space-y-2 p-4">
              <UploadOutlined className="text-4xl text-green-600" />
              <p className="text-lg font-medium text-gray-700">Upload Plant Image</p>
              <p className="text-sm text-gray-500">Supports JPG, PNG up to 5MB</p>
            </div>
          </Upload>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/2">
              <div className="border rounded-lg overflow-hidden bg-gray-50">
                <Image
                  src={imageUrl}
                  alt="Uploaded plant"
                  className="w-full h-auto max-h-96 object-contain"
                />
              </div>
              <Button 
                onClick={handleRetry}
                icon={<ReloadOutlined />}
                className="mt-4"
                type="primary"
              >
                Analyze Another Image
              </Button>
            </div>
            
            <div className="w-full md:w-1/2 space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                  <Spin size="large" />
                  <p className="text-gray-600">Analyzing image...</p>
                  <p className="text-sm text-gray-500">This may take a few seconds</p>
                </div>
              ) : result ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                    <h3 className="text-lg font-semibold text-green-800 mb-2">Detection Result</h3>
                    <div className="space-y-2">
                      <p className="text-gray-700">
                        <span className="font-medium">Condition:</span> {result.disease}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">Confidence:</span> {(result.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <h4 className="font-medium text-blue-800 mb-2">Description</h4>
                    <p className="text-gray-700">{result.description}</p>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                    <h4 className="font-medium text-yellow-800 mb-2">Recommended Treatment</h4>
                    <p className="text-gray-700">{result.treatment}</p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiseaseDetection;