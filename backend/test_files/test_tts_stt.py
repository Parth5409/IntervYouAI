# test_tts_stt.py
"""
Comprehensive test suite for TTS and STT services in IntervYou.AI
Tests both Kokoro-82M TTS and Distil-Whisper Large v3 STT
"""
import asyncio
import os
import time
import sys
from pathlib import Path
from tts.tts_service import tts_service
from stt.stt_service import stt_service

# Add backend directory to path if needed
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

# Test Configuration
TEST_AUDIO_DIR = "test_audio_output"
os.makedirs(TEST_AUDIO_DIR, exist_ok=True)


# Test texts covering various interview scenarios
TEST_CASES = {
    "simple": "Hello, welcome to your technical interview.",
    
    "technical_jargon": """
        Can you explain your experience with React, FastAPI, and PostgreSQL? 
        Have you worked with LangChain or FAISS vector databases?
    """,
    
    "company_names": """
        I see you've worked at Google, Microsoft, and Amazon. 
        Tell me about your experience with AWS Lambda and Docker containers.
    """,
    
    "complex_technical": """
        Describe how you would implement a WebSocket-based real-time 
        communication system using Socket.io with JWT authentication 
        and Redis for session management.
    """,
    
    "behavioral": """
        Tell me about a time when you had to debug a critical production issue. 
        How did you approach the problem and what was the outcome?
    """,
    
    "salary_negotiation": """
        Based on your experience with full-stack development and AI integration, 
        what are your salary expectations for this senior engineer position?
    """
}


async def test_tts_generation():
    """Test TTS generation with Kokoro-82M"""
    print("\n" + "="*70)
    print("TESTING TTS (Text-to-Speech) - Kokoro-82M")
    print("="*70)
    
    if not tts_service.model:
        print("❌ TTS Service failed to initialize!")
        return False
    
    results = []
    for test_name, test_text in TEST_CASES.items():
        print(f"\n📝 Testing: {test_name}")
        print(f"   Text: {test_text[:60]}...")
        
        start_time = time.time()
        audio_bytes = await tts_service.text_to_audio(test_text)
        generation_time = time.time() - start_time
        
        if audio_bytes:
            # Save audio file
            output_file = os.path.join(TEST_AUDIO_DIR, f"tts_{test_name}.wav")
            with open(output_file, 'wb') as f:
                f.write(audio_bytes)
            
            file_size_kb = len(audio_bytes) / 1024
            print(f"   ✅ SUCCESS")
            print(f"   ⏱️  Generation time: {generation_time:.3f} seconds")
            print(f"   📦 Audio size: {file_size_kb:.2f} KB")
            print(f"   💾 Saved to: {output_file}")
            results.append(True)
        else:
            print(f"   ❌ FAILED - No audio generated")
            results.append(False)
    
    success_rate = sum(results) / len(results) * 100
    print(f"\n{'='*70}")
    print(f"TTS Test Results: {sum(results)}/{len(results)} passed ({success_rate:.1f}%)")
    print(f"{'='*70}")
    
    return all(results)


async def test_stt_transcription():
    """Test STT transcription with the STTService."""
    print("\n" + "="*70)
    print("TESTING STT (Speech-to-Text) - STTService")
    print("="*70)
    
    if not stt_service.model:
        print("❌ STT Service failed to initialize!")
        return False

    results = []
    audio_files = [f for f in os.listdir(TEST_AUDIO_DIR) if f.startswith("tts_") and f.endswith(".wav")]
    
    if not audio_files:
        print("\n⚠️  No TTS audio files found. Run TTS tests first!")
        return False
    
    for audio_file in audio_files:
        test_name = audio_file.replace("tts_", "").replace(".wav", "")
        audio_path = os.path.join(TEST_AUDIO_DIR, audio_file)
        
        print(f"\n🎤 Testing: {test_name}")
        print(f"   Audio file: {audio_file}")
        
        try:
            with open(audio_path, 'rb') as f:
                audio_bytes = f.read()

            start_time = time.time()
            transcript = await stt_service.transcribe_audio(audio_bytes, test_name)
            transcription_time = time.time() - start_time
            
            print(f"   ✅ SUCCESS")
            print(f"   ⏱️  Transcription time: {transcription_time:.3f} seconds")
            print(f"   📝 Transcript: {transcript[:100]}...")
            results.append(True)
            
        except Exception as e:
            print(f"   ❌ FAILED - {e}")
            results.append(False)
    
    success_rate = sum(results) / len(results) * 100
    print(f"\n{'='*70}")
    print(f"STT Test Results: {sum(results)}/{len(results)} passed ({success_rate:.1f}%)")
    print(f"{'='*70}")
    
    return all(results)


async def test_round_trip():
    """Test complete TTS -> STT round trip"""
    print("\n" + "="*70)
    print("TESTING ROUND TRIP (TTS → Audio → STT)")
    print("="*70)
    
    test_text = "Can you explain your experience with microservices architecture?"
    print(f"\n📝 Original text: {test_text}")
    
    # Generate audio
    print("\n🔊 Generating audio with TTS...")
    start_tts = time.time()
    audio_bytes = await tts_service.text_to_audio(test_text)
    tts_time = time.time() - start_tts
    
    if not audio_bytes:
        print("   ❌ TTS generation failed")
        return False
    
    # Save temporary audio
    temp_audio = os.path.join(TEST_AUDIO_DIR, "roundtrip_test.wav")
    with open(temp_audio, 'wb') as f:
        f.write(audio_bytes)
    print(f"   ✅ Audio generated in {tts_time:.3f}s")
    
    # Transcribe audio
    print("\n🎤 Transcribing audio with STT...")
    try:
        with open(temp_audio, 'rb') as f:
            audio_bytes_for_stt = f.read()

        start_stt = time.time()
        transcript = await stt_service.transcribe_audio(audio_bytes_for_stt, "roundtrip_test")
        stt_time = time.time() - start_stt
        
        print(f"   ✅ Transcribed in {stt_time:.3f}s")
        print(f"\n📊 ROUND TRIP RESULTS:")
        print(f"   Original:    {test_text}")
        print(f"   Transcribed: {transcript}")
        print(f"   Total time:  {tts_time + stt_time:.3f}s")
        
        return True
        
    except Exception as e:
        print(f"   ❌ STT transcription failed: {e}")
        return False


async def test_performance_benchmark():
    """Benchmark performance metrics"""
    print("\n" + "="*70)
    print("PERFORMANCE BENCHMARK")
    print("="*70)
    
    # Test various text lengths
    lengths = {
        "short": "Hello, how are you?",
        "medium": "Can you describe your experience with Python development and API design? " * 2,
        "long": "Tell me about a complex technical challenge you faced in your previous role. " * 5
    }
    
    for length_type, text in lengths.items():
        print(f"\n📏 Testing {length_type} text ({len(text)} chars)")
        
        # TTS timing
        start = time.time()
        audio = await tts_service.text_to_audio(text)
        tts_time = time.time() - start
        
        if audio:
            print(f"   TTS: {tts_time:.3f}s ({len(audio)/1024:.1f} KB)")
        else:
            print(f"   TTS: FAILED")


def print_system_info():
    """Print system information"""
    print("\n" + "="*70)
    print("SYSTEM INFORMATION")
    print("="*70)
    
    import torch
    print(f"PyTorch version: {torch.__version__}")
    print(f"CUDA available: {torch.cuda.is_available()}")
    if torch.cuda.is_available():
        print(f"CUDA device: {torch.cuda.get_device_name(0)}")
        print(f"CUDA memory: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.2f} GB")
    
    print(f"Test output directory: {TEST_AUDIO_DIR}")


async def main():
    """Run all tests"""
    print("\n" + "="*70)
    print("IntervYou.AI - TTS & STT TEST SUITE")
    print("="*70)
    
    print_system_info()
    
    # Run tests
    test_results = {}
    
    # Test TTS
    test_results['tts'] = await test_tts_generation()
    
    # Test STT
    test_results['stt'] = await test_stt_transcription()
    
    # Test round trip
    test_results['roundtrip'] = await test_round_trip()
    
    # Performance benchmark
    await test_performance_benchmark()
    
    # Final summary
    print("\n" + "="*70)
    print("FINAL TEST SUMMARY")
    print("="*70)
    for test_name, result in test_results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name.upper():15} {status}")
    
    all_passed = all(test_results.values())
    print("="*70)
    print(f"\n{'🎉 ALL TESTS PASSED!' if all_passed else '⚠️  SOME TESTS FAILED'}")
    print(f"\n📁 Audio files saved in: {TEST_AUDIO_DIR}/")
    print("\n")
    
    return all_passed


if __name__ == "__main__":
    try:
        result = asyncio.run(main())
        sys.exit(0 if result else 1)
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Test suite crashed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    