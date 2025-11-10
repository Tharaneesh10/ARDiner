// In your CategoryPage.js, change this part:
{item.model3D && (
  <button 
    className="ar-view-btn"
    onClick={() => handleARView(item)}
  >
    👁️ View in AR
  </button>
)}

// To this (temporary fix):
<button 
  className="ar-view-btn"
  onClick={() => handleARView(item)}
  style={{ 
    opacity: item.model3D ? 1 : 0.5,
    cursor: item.model3D ? 'pointer' : 'not-allowed'
  }}
  disabled={!item.model3D}
>
  👁️ {item.model3D ? 'View in AR' : 'No 3D Model'}
</button>