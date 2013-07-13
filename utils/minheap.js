function minHeap (){
    this.initialize = function(){
        this.pointer = 0;
        this.heap = new Array();
    }

    this.propagateUp = function(){
        var pos = this.pointer;
        var prev = 0;
        while(pos > 0){
            console.log('in propagate' + pos);
            if(pos % 2 === 1){
                prev = (pos-1)/2;
            }
            else{
                prev = (pos-2)/2;
            }
            if(this.heap[pos] < this.heap[prev]){
                this.swap(pos,prev);
            }
            pos = prev;
        }
    }

    this.empty = function(){
        console.log(this.pointer);
        return this.pointer === 0;
    }

    this.propagateDown = function(){
        //Remove last element from heap. Put it into top element.
        if(!this.empty()){
            this.heap[0] = this.heap[this.pointer-1];
            this.heap.pop();
            this.pointer--;
        }
        console.log('in propagate down' + this.pointer);
        
        var pos = 0;
        var flag = true;
        while(pos < this.pointer){
            console.log('in propagate while loop:' + pos + ',' + this.pointer);
            var left = 2*pos+1;
            var right = 2*pos+2;
            
            //edge cases
            if(left >= this.pointer) return;
            if(right >= this.pointer){
                if (this.heap[pos]>this.heap[left]){
                    this.swap(left,pos);
                    pos = left;
                    continue;
                }
                else break;
            }

            //regular case - when both left and right exist
            var next = this.heap[left]<this.heap[right]?left:right;
            if(this.heap[pos] > this.heap[next]) {
                this.swap(pos,next);
                pos = next;
            }
            else break;
        }
    }

    this.swap = function(posA,posB){
        var tmp = this.heap[posA];
        this.heap[posA] = this.heap[posB];
        this.heap[posB] = tmp;
    }

    this.push = function(val){
        this.heap[this.pointer] = val;
        this.propagateUp();
        this.pointer++;
    }

    this.pop = function(){
        var ret = this.heap[0];
        this.propagateDown();
        return ret;
    }
    this.initialize();
}
