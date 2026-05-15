import { Component } from '@angular/core';
import { ApiServiceService } from '../services/api-service.service';
import { OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { loadFamilyTree } from '../utils/load-family-tree';

@Component({
  selector: 'app-family-tree',
  standalone: true,
  templateUrl: './family-tree.component.html',
  styleUrls: ['./family-tree.component.css'],
})
export class FamilyTreeComponent implements OnInit {
  // @ViewChild('svgElement') svgElement: ElementRef;

  isSingleSelect: boolean | undefined
  isSelectColor: boolean = true;

  constructor(
    private appService: ApiServiceService,
    private toaster: ToastrService,
    public route: ActivatedRoute,
    public router: Router,
  ) {
    this.route.queryParams.subscribe((params) => {
      this.isSingleSelect = params['tap'] === 'true'
      if (params['selectColor'] === 'false') {
        this.isSelectColor = false
      }
    });
  }

  isUndoClicked: boolean = false;
  familyIdLocal: any;
  ngOnInit() {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      const familyId = paramMap.get('family_id');
      this.familyIdLocal = familyId;
      this.createTreeDetails(familyId);
      const treeDiv = document.getElementById('tree') as HTMLElement;

      const svg = treeDiv.querySelector('svg');

      // this.renderer.setAttribute(
      //   svg,
      //   'viewBox',
      //   '-20.914634704589844,-226.82928466796875,390,700'
      // );
    });
  };

  createTreeDetails(family_id: any) {
    this.appService
      .createTree('user/createNewTree', family_id)
      .subscribe(async (res) => {
        if (res.success == true) {
          var parent_level = res.familyTreeDetails;
          const { default: FamilyTree } = await loadFamilyTree();
          FamilyTree.MAX_DEPTH = 1000;

          const tree = document.getElementById('tree');
          if (tree) {
            // FamilyTree.templates['john'].defs =
            //   FamilyTree.templates['john'].defs?.replace(
            //     /stroke="[^"]*"/g,
            //     'stroke="#44b741"'
            //   );
            //FamilyTree.templates["john_male"]["img_0"] = `<image preserveAspectRatio="xMidYMid slice" xlink:href="{val}" x="20" y="-15" width="80" height="80"></image>`;
            FamilyTree.templates["john_male"]["img_1"] = `<image preserveAspectRatio="xMidYMid slice" xlink:href="{val}" x="150" y="-15" width="80" height="80"></image>`;
            // FamilyTree.templates["john_female"]["img_0"] = `<image preserveAspectRatio="xMidYMid slice" xlink:href="{val}" x="20" y="-15" width="80" height="80"></image>`;
            FamilyTree.templates["john_female"]["img_1"] = `<image preserveAspectRatio="xMidYMid slice" xlink:href="{val}" x="150" y="-15" width="80" height="80"></image>`;


            FamilyTree.MAX_DEPTH = 1000;
            var family = new FamilyTree(tree, {
              mouseScrool: FamilyTree.none,
              scaleInitial: 0.7,
              levelSeparation: 70,
              siblingSeparation: 30,
              dottedLines: [{ from: 1, to: 7 }],
              nodeBinding: {
                field_0: 'name',
                img_0: 'img',
                img_1: 'photo2',
                id: 'id',
                relation: 'relation',
              },
              template: 'john',
            });

            family.load(parent_level);
            var focusedNodeId: any = [];

            family.on('click', (sender, args) => {
              sender.editUI.show(args.node.id, false);

              this.appService.get(args.node.id).subscribe((res) => {
                if (res.success == true) {
                  window.location.href = `urlLink/${args.node.id}/${res.is_pet == 1 ? 'p' : 'm'}`;
                }
              })
              // window.location.href = `urlLink/${args.node.id}`;

              if (this.isSingleSelect) {
                if (focusedNodeId.length > 0) {
                  focusedNodeId.forEach((id: any) => {
                    removeOverlay(id);
                  });
                  focusedNodeId = [];
                }
                focusedNodeId.push(args.node.id);
                if (this.isSelectColor) {
                  addOverlay(args.node.id);
                }
              } else {
                if (focusedNodeId.includes(args.node.id)) {
                  focusedNodeId = focusedNodeId.filter((id: any) => id !== args.node.id);
                  removeOverlay(args.node.id);
                } else {
                  focusedNodeId.push(args.node.id);
                  addOverlay(args.node.id);
                }
              }

              family.draw();
              return false;
            });


            // family.on("prerender", (sender, args) => {
            //   if (focusedNodeId.length > 0) {
            //     focusedNodeId.forEach((id: any) => {
            //       if (this.isSelectColor) {
            //         addOverlay(id);
            //       }
            //     });
            //     family.draw();
            //   }
            // });
            family.on("render", (sender, args) => {
              setTimeout(() => {
                if (focusedNodeId.length > 0 && this.isSelectColor) {
                  focusedNodeId.forEach((id: any) => {
                    addOverlay(id);
                  });
                }
              }, 0);
            });

            function addOverlay(id: any) {
              const gElement = document.querySelector(`[data-n-id="${id}"]`);
              if (gElement) {
                if (!gElement.querySelector('.overlay-circle')) {
                  const overlayCircle = document.createElementNS(
                    'http://www.w3.org/2000/svg',
                    'circle'
                  );

                  overlayCircle.setAttribute('cx', '60');
                  overlayCircle.setAttribute('cy', '60');
                  overlayCircle.setAttribute('r', '60');
                  overlayCircle.setAttribute('fill', 'rgba(93, 207, 57, 0.5)');
                  overlayCircle.setAttribute('class', 'overlay-circle');
                  gElement.appendChild(overlayCircle);
                  // family_id.draw()
                }
              }
            }

            const removeOverlay = (id: any) => {
              const gElement = document.querySelector(`[data-n-id="${id}"]`);
              if (gElement) {
                const overlayCircle = gElement.querySelector('.overlay-circle');
                if (overlayCircle) {
                  gElement.removeChild(overlayCircle);
                  // if (!this.isSingleSelect) {
                  //   family_id.draw()
                  // }
                }
              }
            }
          }
        }
      });
  }


  onUndo() {
    if (this.isUndoClicked) {
      this.toaster.error('Already clicked on Undo');
    } else {
      this.appService
        .createTree('user/rollBackLastItem', this.familyIdLocal)
        .subscribe((res) => {
          if (res.success == true) {
            this.createTreeDetails(this.familyIdLocal);
            this.toaster.success('Tree Rolled Back Succesfully');
            this.isUndoClicked = !this.isUndoClicked;
          } else {
            this.toaster.error('Tree Rolled Back was Unsuccessfull');
            this.isUndoClicked = !this.isUndoClicked;
          }
        });
    }
  }

  // zoomViewBox(factor: number) {
  //   const svg = document.querySelector("#tree svg") as SVGSVGElement;
  //   if (!svg) return;

  //   let viewBox = svg.getAttribute("viewBox");
  //   if (!viewBox) return;

  //   let [x, y, width, height] = viewBox.split(",").map(parseFloat);

  //   const targetWidth = width / factor;
  //   const targetHeight = height / factor;

  //   const targetX = x + (width - targetWidth) / 2;
  //   const targetY = y + (height - targetHeight) / 2;

  //   this.animateViewBox(svg, x, y, width, height, targetX, targetY, targetWidth, targetHeight);
  // }

  // animateViewBox(svg: SVGSVGElement, x: number, y: number, width: number, height: number, targetX: number, targetY: number, targetWidth: number, targetHeight: number) {
  //   const duration = 300;
  //   const startTime = performance.now();

  //   const animate = (currentTime: number) => {
  //     let progress = (currentTime - startTime) / duration;
  //     if (progress > 1) progress = 1;
  //     const newX = x + (targetX - x) * progress;
  //     const newY = y + (targetY - y) * progress;
  //     const newWidth = width + (targetWidth - width) * progress;
  //     const newHeight = height + (targetHeight - height) * progress;

  //     svg.setAttribute("viewBox", `${newX},${newY},${newWidth},${newHeight}`);

  //     if (progress < 1) {
  //       requestAnimationFrame(animate);
  //     }
  //   };

  //   requestAnimationFrame(animate);
  // }

} 
