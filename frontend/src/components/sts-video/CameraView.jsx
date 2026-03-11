/**
 * Camera display.
 *
 * The <video> element fills the screen and is visible — the browser
 * automatically applies the correct orientation transform (e.g. 90° CW on
 * Android) and object-fit: cover so the stream fills the portrait screen.
 *
 * The <canvas> sits on top as a fully transparent overlay.  It is sized to
 * the screen dimensions and only receives drawn overlays (skeleton, boxes,
 * text).  Landmark coordinates are pre-transformed to screen space so they
 * align with what the user sees in the video.
 */
export function CameraView({ videoRef, canvasRef }) {
  const videoStyle = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',   // fills portrait screen; browser handles rotation
  };

  const canvasStyle = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    display: 'block',
    // No objectFit — canvas is already sized to the screen in CSS *and*
    // its internal resolution is set to match screen pixels each frame.
  };

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
      <video ref={videoRef} autoPlay playsInline muted style={videoStyle} />
      <canvas ref={canvasRef} style={canvasStyle} />
    </div>
  );
}
