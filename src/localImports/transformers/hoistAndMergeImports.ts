// import cs from 'estree'
import * as cs from '../../tree/ctree'
import * as _ from 'lodash'

import { createImportDeclaration, createLiteral } from '../constructors/baseConstructors'
import { cloneAndStripImportSpecifier } from '../constructors/contextSpecificConstructors'
import { isImportDeclaration } from '../typeGuards'

/**
 * Hoists import declarations to the top of the program & merges duplicate
 * imports for the same module.
 *
 * Note that two modules are the same if and only if their import source
 * is the same. This function does not resolve paths against a base
 * directory. If such a functionality is required, this function will
 * need to be modified.
 *
 * @param program The AST which should have its ImportDeclaration nodes
 *                hoisted & duplicate imports merged.
 */
export const hoistAndMergeImports = (program: cs.Program): void => {
  // Separate import declarations from non-import declarations.
  const importDeclarations = program.body.filter(isImportDeclaration)
  const nonImportDeclarations = program.body.filter(
    (node: cs.Directive | cs.Statement | cs.ModuleDeclaration): boolean =>
      !isImportDeclaration(node)
  )

  // Merge import sources & specifiers.
  const importSourceToSpecifiersMap: Map<
    string,
    Array<cs.ImportSpecifier | cs.ImportDefaultSpecifier | cs.ImportNamespaceSpecifier>
  > = new Map()
  for (const importDeclaration of importDeclarations) {
    const importSource = importDeclaration.source.value
    if (typeof importSource !== 'string') {
      throw new Error('Module names must be strings.')
    }
    const specifiers = importSourceToSpecifiersMap.get(importSource) ?? []
    for (const specifier of importDeclaration.specifiers) {
      // The Acorn parser adds extra information to AST nodes that are not
      // part of the ESTree types. As such, we need to clone and strip
      // the import specifier AST nodes to get a canonical representation
      // that we can use to keep track of whether the import specifier
      // is a duplicate or not.
      const strippedSpecifier = cloneAndStripImportSpecifier(specifier)
      // Note that we cannot make use of JavaScript's built-in Set class
      // as it compares references for objects.
      const isSpecifierDuplicate =
        specifiers.filter(
          (
            specifier: cs.ImportSpecifier | cs.ImportDefaultSpecifier | cs.ImportNamespaceSpecifier
          ): boolean => {
            return _.isEqual(strippedSpecifier, specifier)
          }
        ).length !== 0
      if (isSpecifierDuplicate) {
        continue
      }
      specifiers.push(strippedSpecifier)
    }
    importSourceToSpecifiersMap.set(importSource, specifiers)
  }

  // Convert the merged import sources & specifiers back into import declarations.
  const mergedImportDeclarations: cs.ImportDeclaration[] = []
  importSourceToSpecifiersMap.forEach(
    (
      specifiers: Array<
        cs.ImportSpecifier | cs.ImportDefaultSpecifier | cs.ImportNamespaceSpecifier
      >,
      importSource: string
    ): void => {
      mergedImportDeclarations.push(
        createImportDeclaration(specifiers, createLiteral(importSource))
      )
    }
  )

  // Hoist the merged import declarations to the top of the program body.
  program.body = [...mergedImportDeclarations, ...nonImportDeclarations]
}
