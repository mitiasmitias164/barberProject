import subprocess
import sys

# Run the verification script and capture output
result = subprocess.run(
    [sys.executable, 'verificar_migracao.py'],
    capture_output=True,
    text=True,
    encoding='utf-8'
)

# Print to console
print(result.stdout)
if result.stderr:
    print("STDERR:", result.stderr, file=sys.stderr)

# Save to file
with open('verification_result.txt', 'w', encoding='utf-8') as f:
    f.write(result.stdout)
    if result.stderr:
        f.write("\n\nERROR OUTPUT:\n")
        f.write(result.stderr)

print("\nOutput saved to: verification_result.txt")
