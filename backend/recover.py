import os, re

dist_dir = 'j:/Apps/Vidyaverse Pro/backend/dist/modules'
src_dir  = 'j:/Apps/Vidyaverse Pro/backend/src/modules'

schema_pattern = re.compile(r'\s*schema:\s*\{[^}]+\},?', re.DOTALL)

recovered = 0
for root, dirs, files in os.walk(dist_dir):
    for f in files:
        if f.endswith('.routes.js'):
            js_path = os.path.join(root, f)
            with open(js_path, 'r', encoding='utf-8') as file:
                content = file.read()
            
            # Remove schema blocks
            content = schema_pattern.sub('', content)
            
            # Remove sourceMappingURL
            content = re.sub(r'//# sourceMappingURL=.*$', '', content, flags=re.MULTILINE)
            
            # Add ts-nocheck
            content = '// @ts-nocheck\n' + content
            
            # Add FastifyPluginAsync
            if 'FastifyPluginAsync' not in content:
                content = "import { FastifyPluginAsync } from 'fastify';\n" + content
            
            # Convert default export style if it's "const {name}Routes = async (fastify) =>"
            route_name = f.replace('.routes.js', 'Routes')
            route_name_camel = ''.join([part.capitalize() if i > 0 else part for i, part in enumerate(route_name.split('-'))])
            
            # Convert function signature to TS
            # const idCardRoutes = async (fastify) => { -> const idCardRoutes: FastifyPluginAsync = async (fastify) => {
            content = re.sub(
                rf'const\s+{route_name_camel}\s*=\s*async\s*\(fastify\)\s*=>',
                f'const {route_name_camel}: FastifyPluginAsync = async (fastify) =>',
                content
            )
            
            # Write to src
            rel_path = os.path.relpath(root, dist_dir)
            ts_name = f.replace('.js', '.ts')
            dest_path = os.path.join(src_dir, rel_path, ts_name)
            
            os.makedirs(os.path.dirname(dest_path), exist_ok=True)
            
            with open(dest_path, 'w', encoding='utf-8') as out:
                out.write(content)
            
            recovered += 1
            print('Recovered ' + dest_path)

print('Total recovered: ' + str(recovered))
